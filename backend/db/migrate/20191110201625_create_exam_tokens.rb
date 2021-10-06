class CreateExamTokens < ActiveRecord::Migration[6.0]
    def change
        create_table :exam_tokens do |t|
            t.references :exam, null: false, foreign_key: true
            t.references :user, null: true, foreign_key: true
            t.references :room, null: true, foreign_key: true
            t.datetime :expiry
            t.string :token
            t.string :cookie

            t.timestamps
        end
        add_index :exam_tokens, :token
        add_index :exam_tokens, :cookie
    end
end
