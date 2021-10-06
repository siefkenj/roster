# frozen_string_literal: true

class Api::V1::UsersController < ApplicationController
    before_action :fetch_active_user

    def active_user
        render_success @active_user
    end

    def active_user_update
        if @active_user.utorid == params[:utorid]
            render_on_condition(
                object: @active_user,
                condition: proc { @active_user.update!(active_user_params) }
            )
        else
            render_error message:
                             'Cannot update a user with different credentials'
        end
    end

    private

    def active_user_params
        params.slice(:name).permit(:name)
    end

    def fetch_active_user
        @active_user = ActiveUserService.active_user request
    end
end
