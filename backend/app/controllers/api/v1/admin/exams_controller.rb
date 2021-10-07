# frozen_string_literal: true

class Api::V1::Admin::ExamsController < ApplicationController
    # GET
    def index
        find_active_user
        render_success @active_user.exams.order(end_time: :DESC)
    end

    # GET :id
    def show
        render_success find_exam
    end

    # POST :id
    def create
        # this route may be accessed by `/exams/:url_token` or by `/exams`. We want
        # to support either use case.
        @exam =
            Exam.find_by(url_token: params[:id]) ||
                Exam.find_by(url_token: params[:url_token])
        update && return if @exam

        find_active_user
        @exam = Exam.new(user: @active_user)
        update
    end

    # POST :id/delete
    def delete
        find_exam
        render_on_condition(object: @exam, condition: proc { @exam.destroy! })
    end

    private

    def find_active_user
        @active_user = ActiveUserService.active_user request
    end

    def find_exam
        @exam = Exam.find_by!(url_token: params[:id])
        @exam
    end

    def exam_params
        params.permit(:name, :end_time)
    end

    def update
        render_on_condition(
            object: @exam, condition: proc { @exam.update!(exam_params) }
        )
    end
end
