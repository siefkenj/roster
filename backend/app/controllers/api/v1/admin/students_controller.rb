# frozen_string_literal: true

class Api::V1::Admin::StudentsController < ApplicationController
    before_action :find_exam

    # GET
    def index
        render_success @exam.students.order(id: :ASC)
    end

    # GET :id
    def show
        render_success @exam.students.find_by!(id: params[:id])
    end

    # POST :id
    def create
        @student = @exam.students.find_by(id: params[:id])
        update && return if @student

        @student = Student.new(exam: @exam)
        update
    end

    # POST :id/delete
    def delete
        @student = @exam.students.find_by!(id: params[:id])
        render_on_condition(
            object: @student, condition: proc { @student.destroy! }
        )
    end

    def upload_roster
        start_transaction_and_rollback_on_exception do
            Student.destroy_by(exam: @exam)
            render_success @exam.students.create!(roster_params[:roster])
        end
    end

    private

    def find_exam
        @exam = Exam.find_by!(url_token: params[:exam_id])
        @exam
    end

    def student_params
        params.permit(
            :first_name,
            :last_name,
            :utorid,
            :student_number,
            :matching_data,
            :email
        )
    end

    def roster_params
        params.slice(:roster).permit(
            roster: %i[
                first_name
                last_name
                utorid
                student_number
                matching_data
                email
            ]
        )
    end

    def update
        render_on_condition(
            object: @student,
            condition: proc { @student.update!(student_params) }
        )
    end
end
