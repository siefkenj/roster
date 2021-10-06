# frozen_string_literal: true

class UserSerializer < ActiveModel::Serializer
    attributes :id, :utorid, :name, :last_seen
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
