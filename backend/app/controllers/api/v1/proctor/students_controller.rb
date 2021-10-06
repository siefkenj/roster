# frozen_string_literal: true

class Api::V1::Proctor::StudentsController < ApplicationController
    before_action :find_and_validate_exam_token

    # GET authenticated/:authentication_id/students
    def index
        render_success @exam_token.exam.students.order(id: :ASC)
    end

    # GET exam_tokens/:authentication_id/bstudents/:id/booklet_matches
    def booklet_matches
        render_success @exam_token.exam.booklet_matches.find_by(
                           student_id: params[:id]
                       )
    end

    private

    def find_and_validate_exam_token
        @exam_token = ExamToken.find_by!(cookie: params[:authenticated_id])
        # If the exam token is expired, we should error now and not do anything
        if @exam_token.expiry && (Time.now > @exam_token.expiry)
            raise StandardError, 'Exam token has expired'
        end

        @exam_token
    end
end
