# frozen_string_literal: true

class ExamTokenSerializer < ActiveModel::Serializer
    attributes :id, :user_id, :room_id, :expiry, :token, :cookie, :status
end
