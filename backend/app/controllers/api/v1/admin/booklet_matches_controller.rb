# frozen_string_literal: true

class Api::V1::Admin::BookletMatchesController < ApplicationController
    # GET /users
    def index
        find_exam
        render_success @exam.booklet_matches.order(booklet: :ASC)
    end

    private

    def find_exam
        @exam = Exam.find_by!(url_token: params[:exam_id])
        @exam
    end
end
