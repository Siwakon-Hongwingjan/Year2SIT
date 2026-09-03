#!/usr/bin/env python3
"""Quiz runner. Usage:
  python3 quiz.py reviews/quiz-01.json [--shuffle]            interactive
  python3 quiz.py reviews/quiz-01.json --template > answers.txt   make blank answer file
  python3 quiz.py reviews/quiz-01.json --grade answers.txt     grade a filled-in answer file
"""
import json
import random
import sys

TRUTHY = {"true", "t", "จริง", "ถูก", "y", "yes", "1"}
FALSY = {"false", "f", "เท็จ", "ผิด", "n", "no", "0"}


def check_mc(given, correct):
    return given.strip().upper() == correct.strip().upper()


def check_short(given, correct):
    # ponytail: substring match, not fuzzy/NLP matching. Swap for difflib ratio if this misses too much.
    g, c = given.strip().lower(), correct.strip().lower()
    return g == c or (g and g in c) or (c and c in g)


def check_tf(given, correct):
    g = given.strip().lower()
    if g in TRUTHY:
        given_bool = True
    elif g in FALSY:
        given_bool = False
    else:
        return False
    return given_bool == (correct.strip().lower() == "true")


def check(q, given):
    if q["type"] == "mc":
        return check_mc(given, q["answer"])
    if q["type"] == "tf":
        return check_tf(given, q["answer"])
    return check_short(given, q["answer"])


def load_questions(path):
    return json.loads(open(path, encoding="utf-8").read())["questions"]


def run_quiz(path, shuffle=False):
    questions = load_questions(path)
    if shuffle:
        random.shuffle(questions)

    score = 0
    wrong = []
    for i, q in enumerate(questions, 1):
        print(f"\n{i}. {q['q']}")
        if q["type"] == "mc":
            for choice in q["choices"]:
                print(f"   {choice}")
        elif q["type"] == "tf":
            print("   (true/false)")
        given = input("ตอบ: ")
        if check(q, given):
            print("ถูกต้อง!")
            score += 1
        else:
            print(f"ผิด — เฉลย: {q['answer']}")
            wrong.append(i)

    print(f"\n=== คะแนน: {score}/{len(questions)} ===")
    if wrong:
        print(f"ข้อที่ควรทบทวน: {', '.join(map(str, wrong))}")


def make_template(path):
    for i, q in enumerate(load_questions(path), 1):
        print(f"# {i}. {q['q']}")
        if q["type"] == "mc":
            for c in q["choices"]:
                print(f"#    {c}")
        elif q["type"] == "tf":
            print("#    (true/false)")
        print()


def grade_file(quiz_path, answers_path):
    questions = load_questions(quiz_path)
    answers = [line.rstrip("\n") for line in open(answers_path, encoding="utf-8") if not line.strip().startswith("#")]
    score = 0
    wrong = []
    for i, q in enumerate(questions, 1):
        given = answers[i - 1].strip() if i - 1 < len(answers) else ""
        print(f"\n{i}. {q['q']}")
        print(f"   ตอบ: {given!r}")
        if check(q, given):
            print("   ถูกต้อง!")
            score += 1
        else:
            print(f"   ผิด — เฉลย: {q['answer']}")
            wrong.append(i)

    print(f"\n=== คะแนน: {score}/{len(questions)} ===")
    if wrong:
        print(f"ข้อที่ควรทบทวน: {', '.join(map(str, wrong))}")


def demo():
    assert check_mc("b", "B")
    assert not check_mc("a", "B")
    assert check_short("systemctl", "systemctl")
    assert check_short("it manages services", "manages services")
    assert not check_short("apt", "yum")
    assert check_tf("true", "true")
    assert check_tf("ผิด", "false")
    assert not check_tf("จริง", "false")
    print("self-check ok")


if __name__ == "__main__":
    if "--test" in sys.argv:
        demo()
    elif len(sys.argv) < 2:
        print("usage: quiz.py <quiz.json> [--shuffle | --template | --grade <answers.txt>]")
        sys.exit(1)
    elif "--template" in sys.argv:
        make_template(sys.argv[1])
    elif "--grade" in sys.argv:
        answers_file = sys.argv[sys.argv.index("--grade") + 1]
        grade_file(sys.argv[1], answers_file)
    else:
        run_quiz(sys.argv[1], shuffle="--shuffle" in sys.argv)
