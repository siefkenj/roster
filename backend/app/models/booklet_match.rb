# frozen_string_literal: true

# A class representing a position_preference for an application
# to a position with a preference level.
class BookletMatch < ApplicationRecord
    belongs_to :student
    belongs_to :exam
    belongs_to :user
    belongs_to :room
    belongs_to :exam_token

    validates :booklet, numericality: true, allow_nil: false
    validates_uniqueness_of :student_id, scope: %i[exam_id]
    validates_uniqueness_of :booklet, scope: %i[exam_id]
end

# == Schema Information
#
# Table name: booklet_matches
#
#  id           :bigint(8)        not null, primary key
#  booklet      :string
#  comments     :string
#  time_matched :datetime
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  exam_id      :bigint(8)        not null
#  room_id      :bigint(8)        not null
#  student_id   :bigint(8)        not null
#  user_id      :bigint(8)        not null
#
# Indexes
#
#  index_booklet_matches_on_exam_id     (exam_id)
#  index_booklet_matches_on_room_id     (room_id)
#  index_booklet_matches_on_student_id  (student_id)
#  index_booklet_matches_on_user_id     (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (exam_id => exams.id)
#  fk_rails_...  (room_id => rooms.id)
#  fk_rails_...  (student_id => students.id)
#  fk_rails_...  (user_id => users.id)
#
