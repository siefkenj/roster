# frozen_string_literal: true

class Api::V1::Proctor::AuthenticatedController < ApplicationController
    before_action :find_and_validate_exam_token

    # GET authenticated/:id/students
    def students
        render_success @exam_token.exam.students.order(id: :ASC)
    end

    # GET exam_tokens/:id/rooms
    def rooms
        render_success @exam_token.exam.rooms.order(id: :ASC)
    end

    # GET exam_tokens/:id/exam_tokens
    def exam_tokens
        render_success @exam_token
    end

    private

    def find_and_validate_exam_token
        @exam_token = ExamToken.find_by!(cookie: params[:id])
        # If the exam token is expired, we should error now and not do anything
        if @exam_token.expiry && Time.now > @exam_token.expiry
            raise StandardError, 'Exam token has expired'
        end

        @exam_token
    end
end
