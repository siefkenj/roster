# frozen_string_literal: true

class Room < ApplicationRecord
    belongs_to :exam
    has_many :exam_tokens, dependent: :destroy
end
# == Schema Information
#
# Table name: rooms
#
#  id         :bigint(8)        not null, primary key
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  exam_id    :bigint(8)        not null
#
# Indexes
#
#  index_rooms_on_exam_id  (exam_id)
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
