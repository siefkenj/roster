class CreateBookletMatches < ActiveRecord::Migration[6.0]
    def change
        create_table :booklet_matches do |t|
            t.references :exam, null: false, foreign_key: true
            t.references :student, null: false, foreign_key: true
            t.references :user, null: false, foreign_key: true
            t.references :room, null: false, foreign_key: true
            t.references :exam_token, null: true, foreign_key: true
            t.string :comments
            t.string :booklet
            t.datetime :time_matched
            

            t.timestamps
        end
    end
end
