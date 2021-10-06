class CreateStudents < ActiveRecord::Migration[6.0]
    def change
        create_table :students do |t|
            t.references :exam, null: false, foreign_key: true
            t.string :utorid, null: false
            t.string :student_number
            t.string :first_name
            t.string :last_name
            t.string :email
            t.string :matching_data

            t.timestamps
        end
    end
end
