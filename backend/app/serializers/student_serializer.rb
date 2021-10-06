# frozen_string_literal: true

class StudentSerializer < ActiveModel::Serializer
    attributes :id,
               :utorid,
               :student_number,
               :first_name,
               :last_name,
               :email,
               :matching_data
end
