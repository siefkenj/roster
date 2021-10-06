# frozen_string_literal: true

class Api::V1::Admin::UsersController < ApplicationController
    def active_user
        render_success ActiveUserService.active_user request
    end

    # GET /users
    def index
        find_exam
        render_success User.joins(:exam_tokens).where(
                           exam_tokens: { exam: @exam }
                       ).distinct
    end

    private

    def find_exam
        @exam = Exam.find_by!(url_token: params[:exam_id])
        @exam
    end

    def user_params
        params.permit(:name)
    end

    def update
        render_on_condition(
            object: @user, condition: proc { @user.update!(user_params) }
        )
    end
end
