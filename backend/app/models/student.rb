# frozen_string_literal: true

class Student < ApplicationRecord
    belongs_to :exam

    validates :utorid, uniqueness: { scope: :exam_id }
end
# == Schema Information
#
# Table name: students
#
#  id             :bigint(8)        not null, primary key
#  email          :string
#  first_name     :string
#  last_name      :string
#  matching_data  :string
#  student_number :string
#  utorid         :string           not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  exam_id        :bigint(8)        not null
#
# Indexes
#
#  index_students_on_exam_id  (exam_id)
#
# Foreign Keys
#
#  fk_rails_...  (exam_id => exams.id)
#

#
# Indexes
#
#  index_offers_on_assignment_id  (assignment_id)
#  index_offers_on_url_token      (url_token)
#
