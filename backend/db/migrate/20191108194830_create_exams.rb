# frozen_string_literal: true

class CreateExams < ActiveRecord::Migration[6.0]
    def change
        create_table :exams do |t|
            t.references :user, null: false, foreign_key: true
            t.datetime :end_time
            t.string :name
            t.string :url_token

            t.timestamps
        end
    end
end
