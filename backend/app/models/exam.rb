# frozen_string_literal: true

class Exam < ApplicationRecord
    belongs_to :user
    has_many :rooms, dependent: :destroy
    has_many :students, dependent: :destroy
    has_many :booklet_matches, dependent: :destroy
    has_many :exam_tokens, dependent: :destroy

    has_secure_token :url_token

    validates_presence_of :name, allow_nil: false
end

# == Schema Information
#
# Table name: exams
#
#  id         :bigint(8)        not null, primary key
#  end_time   :datetime
#  name       :string
#  url_token  :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
