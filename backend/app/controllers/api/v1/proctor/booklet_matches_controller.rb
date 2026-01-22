# frozen_string_literal: true

class Api::V1::Proctor::BookletMatchesController < ApplicationController
    before_action :find_and_validate_exam_token

    # GET authenticated/:id/booklet_matches
    def index
        render_success @exam.booklet_matches.order(id: :ASC)
    end

    def show
        find_booklet_match
        render_success @booklet_match
    end

    def create
        @booklet_match = @exam.booklet_matches.find_by(id: params[:id])
        find_active_user
        update && return if @booklet_match

        @booklet_match =
            BookletMatch.new(
                exam: @exam,
                room_id: @exam_token.room_id,
                user: @active_user,
                exam_token: @exam_token
            )
        update
    end

    def delete
        find_booklet_match
        render_on_condition(
            object: @booklet_match, condition: proc { @booklet_match.destroy! }
        )
    end

    private

    def find_active_user
        @active_user = ActiveUserService.active_user request
    end

    def find_and_validate_exam_token
        @exam_token = ExamToken.find_by!(cookie: params[:authenticated_id])
        # If the exam token is expired, we should error now and not do anything
        if @exam_token.expiry && Time.now > @exam_token.expiry
            raise StandardError, 'Exam token has expired'
        end

        @exam = @exam_token.exam
        @exam_token
    end

    def find_booklet_match
        @booklet_match = @exam.booklet_matches.find_by!(id: params[:id])
    end

    def booklet_matches_params
        params.slice(:booklet, :comments, :student_id).permit(
            :booklet,
            :comments,
            :student_id
        )
    end

    def sanitize_booklet_number
        if params[:booklet]
            # Taken from https://stackoverflow.com/questions/60509557/regex-remove-leading-zeros-but-keep-single-zero
            params[:booklet] = params[:booklet].strip.sub(/^(?:0+(?=[1-9])|0+(?=0$))/, '')
        end
    end

    def error_if_booklet_number_in_use
        if params[:booklet]
            booklet_number = params[:booklet]
            booklet =
                @exam.booklet_matches.where(booklet: booklet_number).where.not(
                    id: @booklet_match.id
                ).first

            if booklet
                raise StandardError,
                      "Booklet number '#{
                          booklet_number
                      }' has been taken by student with utorid='#{
                          booklet.student.utorid
                      }'"
            end
        end
    end

    def update
        sanitize_booklet_number
        error_if_booklet_number_in_use
        render_on_condition(
            object: @booklet_match,
            condition:
                proc do
                    @booklet_match.time_matched = Time.now
                    @booklet_match.update!(booklet_matches_params)
                end
        )
    end
end
