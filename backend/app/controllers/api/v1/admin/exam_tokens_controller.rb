# frozen_string_literal: true

class Api::V1::Admin::ExamTokensController < ApplicationController
    before_action :find_exam

    # GET
    def index
        render_success @exam.exam_tokens.order(id: :ASC)
    end

    # GET :id
    def show
        render_success @exam.exam_tokens.find_by!(id: params[:id])
    end

    # POST :id
    def create
        @exam_token = @exam.exam_tokens.find_by(id: params[:id])
        update && return if @exam_token

        @exam_token = ExamToken.new(exam: @exam)
        update
    end

    # POST :id/delete
    def delete
        @exam_token = @exam.exam_tokens.find_by!(id: params[:id])
        render_on_condition(
            object: @exam_token, condition: proc { @exam_token.destroy! }
        )
    end

    # POST :id/invalidate
    def invalidate
        @exam_token = @exam.exam_tokens.find_by!(id: params[:id])
        render_on_condition(
            object: @exam_token,
            condition: proc { @exam_token.update!(expiry: Time.now - 1.second) }
        )
    end

    private

    def find_exam
        @exam = Exam.find_by!(url_token: params[:exam_id])
        @exam
    end

    def exam_token_params
        params.permit(:room_id, :expiry)
    end

    def update
        render_on_condition(
            object: @exam_token,
            condition: proc { @exam_token.update!(exam_token_params) }
        )
    end
end
