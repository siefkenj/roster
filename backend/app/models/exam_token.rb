# frozen_string_literal: true

class ExamToken < ApplicationRecord
    require 'securerandom'
    belongs_to :exam
    has_many :booklet_matches
    before_create :set_token, :set_expiry

    def set_token
        self.token = SecureRandom.base36(6)
        count = 0
        while ExamToken.find_by(token: token)
            self.token = SecureRandom.base36(6)
            count += 1
            if count > 20
                raise StandardError,
                      'Error when creating ExamToken. Cannot find unique token (too many in use)'
            end
        end
    end

    def set_cookie
        self.cookie = SecureRandom.hex
        count = 0
        while ExamToken.find_by(cookie: cookie)
            self.cookie = SecureRandom.hex
            count += 1
            if count > 20
                raise StandardError,
                      'Error when creating ExamToken. Cannot find unique cookie (too many in use)'
            end
        end
    end

    def set_expiry
        if exam.end_time && !expiry
            # If we didn't explicitly set an expiry, set one based on the testing day.
            # If the testing day has passed, assume we want the token to last for one
            # day (because we're probably creating it post-facto for some reason.)
            self.expiry = [exam.end_time, Time.now].max + 1.day
        end
    end

    def short_token_expired?
        return true unless cookie.blank?
        return Time.now > expiry if expiry

        false
    end

    def status
        return :expired if Time.now > expiry
        return :active unless cookie.blank?

        :unused
    end
end
# == Schema Information
#
# Table name: test_tokens
#
#  id         :bigint(8)        not null, primary key
#  expiry     :datetime
#  token      :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  exam_id    :bigint(8)        not null
#
# Indexes
#
#  index_test_tokens_on_exam_id  (exam_id)
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
