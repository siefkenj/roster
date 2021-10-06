# frozen_string_literal: true

class Api::V1::Proctor::ExamTokensController < ApplicationController
    # GET exam_tokens/:id
    # The details about a token can be retrieved if it is not expired. You might want to do
    # this because the token might be pre-linked to a room, and you'd like to know which room
    # before you activate the token.
    def show
        find_by_token
        if @exam_token.short_token_expired?
            render_error message: 'Token is expired or already used'
        else
            render_success @exam_token
        end
    end

    # POST exam_tokens/activate
    def activate
        find_by_token
        find_active_user
        if @exam_token.short_token_expired?
            render_error message: 'Token is expired or already used'
            return
        end
        # We must have a valid room id when activating an exam_token. Otherwise
        # we won't be able to use it to match students
        render_on_condition(
            object: @exam_token,
            condition:
                proc do
                    @exam_token.set_cookie
                    @exam_token.user_id = @active_user.id
                    @exam_token.room_id = validated_room_id
                    # Regardless of the previous expiry time, once a token
                    # is activated, it should only be usable for three hours.
                    @exam_token.expiry = Time.now + 3.hours
                    @exam_token.save!
                end
        )
    end

    # GET exam_tokens/:id/rooms
    def rooms
        find_by_token
        if @exam_token.short_token_expired?
            render_error message: 'Token is expired or already used'
            return
        end
        render_success @exam_token.exam.rooms
    end

    private

    def validated_room_id
        if @exam_token.exam.rooms.exists? params[:room_id]
            return params[:room_id]
        elsif @exam_token.exam.rooms.exists? @exam_token.room_id
            return @exam_token.room_id
        end

        raise StandardError,
              'Cannot activate an exam_token without a valid `room_id`'
    end

    def find_active_user
        @active_user = ActiveUserService.active_user request
    end

    def find_by_token
        @exam_token = ExamToken.find_by!(token: [params[:token], params[:id]])
        @exam_token
    end

    def exam_token_params
        # Warning: this room_id is not validated to ensure it is a room that
        # is linked to the current exam.
        params.slice(:room_id).permit(:room_id)
    end
end
