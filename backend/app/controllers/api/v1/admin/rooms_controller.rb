# frozen_string_literal: true

class Api::V1::Admin::RoomsController < ApplicationController
    before_action :find_exam

    # GET
    def index
        render_success @exam.rooms.order(id: :ASC)
    end

    # GET :id
    def show
        render_success @exam.rooms.find_by!(id: params[:id])
    end

    # POST :id
    def create
        @room = @exam.rooms.find_by(id: params[:id])
        update && return if @room

        @room = Room.new(exam: @exam)
        update
    end

    # POST :id/delete
    def delete
        @room = @exam.rooms.find_by!(id: params[:id])
        render_on_condition(object: @room, condition: proc { @room.destroy! })
    end

    def upload_roster
        start_transaction_and_rollback_on_exception do
            Room.destroy_by(exam: @exam)
            render_success @exam.rooms.create!(roster_params[:roster])
        end
    end

    private

    def find_exam
        @exam = Exam.find_by!(url_token: params[:exam_id])
        @exam
    end

    def room_params
        params.permit(:name)
    end

    def roster_params
        params.slice(:roster).permit(roster: %i[name])
    end

    def update
        render_on_condition(
            object: @room, condition: proc { @room.update!(room_params) }
        )
    end
end
