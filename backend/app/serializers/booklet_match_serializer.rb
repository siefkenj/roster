# frozen_string_literal: true

class BookletMatchSerializer < ActiveModel::Serializer
    attributes :id,
               :student_id,
               :booklet,
               :time_matched,
               :room_id,
               :user_id,
               :comments
end
