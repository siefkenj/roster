# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
    describe 'validations' do
        it { should validate_presence_of(:utorid) }
        it { should validate_uniqueness_of(:utorid) }
    end
end

# == Schema Information
#
# Table name: users
#
#  id         :bigint(8)        not null, primary key
#  last_seen  :datetime
#  name       :string
#  utorid     :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_users_on_utorid  (utorid) UNIQUE
#
