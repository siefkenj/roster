# frozen_string_literal: true

#
# Constraints for authentication
#
# These should probably not be located here, but I'm not sure
# where to put them...
module Constraint
    class Authenticated
        def matches?(request)
            active_user = ActiveUserService.active_user request
            return true if active_user
            Rails.logger.warn "Permission Denied: User '#{
                                  active_user.utorid
                              }' attempted to access a /admin route without permission."
            false
        end
    end
end

Rails.application.routes.draw do
    namespace :api do
        namespace :v1, format: false do
            # Debug
            unless Rails.env.production?
                resources :debug, only: [] do
                    collection do
                        get :active_user, to: 'debug#active_user'
                        post :active_user, to: 'debug#set_active_user'
                        get :users, to: 'debug#users'
                        post :users, to: 'debug#upsert_user'
                        get :routes, to: 'debug#routes'
                        get :serializers, to: 'debug#serializers'
                    end
                end
            end

            namespace :admin do
                constraints(Constraint::Authenticated.new) do
                    # Active User
                    get :active_user, to: 'users#active_user'

                    post 'exams/:id',
                         to: 'exams#create', constraints: { id: /[0-9a-zA-Z]+/ }
                    resources :exams, only: %i[index show create] do
                        member { post :delete }

                        # Students
                        post 'students/roster', to: 'students#upload_roster'
                        # We use POST, not PUT, so we need to set this route up manually
                        post 'students/:id',
                             to: 'students#create',
                             constraints: { id: /[0-9]+/ }
                        resources :students, only: %i[index show create] do
                            member { post :delete }
                        end

                        # Users
                        resources :users, only: %i[index]

                        # Users
                        resources :booklet_matches, only: %i[index]

                        # Rooms
                        post 'rooms/roster', to: 'rooms#upload_roster'
                        # We use POST, not PUT, so we need to set this route up manually
                        post 'rooms/:id',
                             to: 'rooms#create', constraints: { id: /[0-9]+/ }
                        resources :rooms, only: %i[index show create] do
                            member { post :delete }
                        end

                        # ExamTokens
                        resources :exam_tokens, only: %i[index show create] do
                            member { post :delete }
                            member { post :invalidate }
                        end
                    end
                end
            end

            namespace :proctor do
                constraints(Constraint::Authenticated.new) do
                    # Active User
                    get :active_user, to: 'users#active_user'

                    # ExamTokens
                    post 'exam_tokens/activate', to: 'exam_tokens#activate'
                    post 'exam_tokens/:id/activate',
                         to: 'exam_tokens#activate',
                         constraints: { id: /[0-9a-zA-Z]+/ }
                    resources :exam_tokens, only: %i[show] do
                        member { get :rooms }
                    end
                    resources :authenticated, only: [] do
                        member do
                            #get :students
                            get :rooms
                            get :exam_tokens
                        end
                        resources :students, only: %i[index] do
                            member { get :booklet_matches }
                        end
                        # We use POST, not PUT, so we need to set this route up manually
                        post 'booklet_matches/:id',
                             to: 'booklet_matches#create',
                             constraints: { id: /[0-9]+/ }
                        resources :booklet_matches,
                                  only: %i[index show create] do
                            member { post :delete }
                        end
                    end
                end
            end

            # We can get the active user without passing any authentication check
            get :active_user, to: 'users#active_user'
            post :active_user, to: 'users#active_user_update'
        end
    end

    # We proxy URL hashes through `/hash` so that they can be preserved during
    # Shibboleth authentication. For example, if you try to shibboleth-authenticated
    # `tapp.com#/my/route`, after authentication, you will be redirected to `tapp.com`,
    # with the `#/my/route` being lost. Instead, authenticate `tapp.com/hash/my/route`,
    # which will redirect to `tapp.com/#/my/route` after authentication is complete.
    namespace :hash, format: false do
        get '/*path', to: 'hash#index'
    end

    # Catch all other route requests and deliver a standard error payload.
    # Routes that are inaccessible due to lacking permission also end up here.
    #
    # This must be the last route declared as it matches everything.
    match '*path', to: 'missing_routes#error', via: :all
end

# == Route Map
#
