# frozen_string_literal: true

class ExamSerializer < ActiveModel::Serializer
    attributes :url_token, :name, :end_time
end
