# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_12_08_220038) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "booklet_matches", force: :cascade do |t|
    t.bigint "exam_id", null: false
    t.bigint "student_id", null: false
    t.bigint "user_id", null: false
    t.bigint "room_id", null: false
    t.bigint "exam_token_id"
    t.string "comments"
    t.string "booklet"
    t.datetime "time_matched"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["exam_id"], name: "index_booklet_matches_on_exam_id"
    t.index ["exam_token_id"], name: "index_booklet_matches_on_exam_token_id"
    t.index ["room_id"], name: "index_booklet_matches_on_room_id"
    t.index ["student_id"], name: "index_booklet_matches_on_student_id"
    t.index ["user_id"], name: "index_booklet_matches_on_user_id"
  end

  create_table "exam_tokens", force: :cascade do |t|
    t.bigint "exam_id", null: false
    t.bigint "user_id"
    t.bigint "room_id"
    t.datetime "expiry"
    t.string "token"
    t.string "cookie"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["cookie"], name: "index_exam_tokens_on_cookie"
    t.index ["exam_id"], name: "index_exam_tokens_on_exam_id"
    t.index ["room_id"], name: "index_exam_tokens_on_room_id"
    t.index ["token"], name: "index_exam_tokens_on_token"
    t.index ["user_id"], name: "index_exam_tokens_on_user_id"
  end

  create_table "exams", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.datetime "end_time"
    t.string "name"
    t.string "url_token"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_exams_on_user_id"
  end

  create_table "rooms", force: :cascade do |t|
    t.bigint "exam_id", null: false
    t.string "name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["exam_id"], name: "index_rooms_on_exam_id"
  end

  create_table "students", force: :cascade do |t|
    t.bigint "exam_id", null: false
    t.string "utorid", null: false
    t.string "student_number"
    t.string "first_name"
    t.string "last_name"
    t.string "email"
    t.string "matching_data"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["exam_id"], name: "index_students_on_exam_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "utorid"
    t.string "name"
    t.datetime "last_seen"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["utorid"], name: "index_users_on_utorid", unique: true
  end

  add_foreign_key "booklet_matches", "exam_tokens"
  add_foreign_key "booklet_matches", "exams"
  add_foreign_key "booklet_matches", "rooms"
  add_foreign_key "booklet_matches", "students"
  add_foreign_key "booklet_matches", "users"
  add_foreign_key "exam_tokens", "exams"
  add_foreign_key "exam_tokens", "rooms"
  add_foreign_key "exam_tokens", "users"
  add_foreign_key "exams", "users"
  add_foreign_key "rooms", "exams"
  add_foreign_key "students", "exams"
end
