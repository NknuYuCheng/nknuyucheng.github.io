from flask import Flask, render_template, request, jsonify, session
import random

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # 用於 session 管理


# 模擬卡片牌組
VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
DECK = [f'{value}' for value in VALUES]

# 定義卡片的值順序
VALUES_ORDER = {value: index for index, value in enumerate(VALUES)}  # 大到小

# 發牌函數
def deal_hand():
    return random.sample(DECK, 4)

# Bubble Sort
def bubble_sort_with_steps(hand):
    steps = []
    sorted_hand = hand[:]

    for i in range(len(hand) - 1):
        for j in range(len(hand) - 1):
            if i + j < len(hand) - 1:
                if VALUES_ORDER[sorted_hand[j]] > VALUES_ORDER[sorted_hand[j + 1]]:
                    # 交換
                    sorted_hand[j], sorted_hand[j + 1] = sorted_hand[j + 1], sorted_hand[j]
                steps.append(sorted_hand[:])
    return steps

def bubble_sort_with_steps_items(hand):
    steps = []
    sorted_hand = hand[:]

    for i in range(len(hand) - 1):
        for j in range(len(hand) - 1):
            if i + j < len(hand) - 1:
                if VALUES_ORDER[sorted_hand[j]] > VALUES_ORDER[sorted_hand[j + 1]]:
                    # 交換
                    sorted_hand[j], sorted_hand[j + 1] = sorted_hand[j + 1], sorted_hand[j]
                items = [sorted_hand[j],sorted_hand[j+1]]
                steps.append(items)
    return steps




@app.route('/')
def index():
    hand = deal_hand()
    session['hand'] = hand
    session['sorted_hand'] = sorted(hand, key=lambda card: VALUES_ORDER[card])  # 小到大排序
    session['steps'] = bubble_sort_with_steps(hand)  # BubbleSort步驟
    session['steps_items'] = bubble_sort_with_steps_items(hand)  # BubbleSort步驟
    session['current_step'] = 0
    session['user_moves'] = []
    return render_template('index.html', hand=hand)

@app.route('/check_sort', methods=['POST'])
def check_sort():
    user_hand = request.json.get('hand', [])
    user_hand = [card.strip() for card in user_hand]
    
    current_step = session.get('current_step', 0)

    # 確認當前的正確排序
    expected_hand = session['steps'][current_step] if current_step < len(session['steps']) else None

    # 紀錄使用者的移動
    move_record = {
        'cards': user_hand,
        'correct': user_hand == expected_hand
    }
    session['user_moves'].append(move_record)

    print("user_hand:", user_hand)
    print("正確應該是:", expected_hand)
    print("最終:", session['sorted_hand'])
    print("步驟:", session['steps'], len(session['steps']))
    print("current_step:", session['current_step'])
    print("steps_items",session['steps_items'])

    happyending = False
    
    if user_hand == session['sorted_hand']:
        session['current_step'] += 1
        if session['current_step'] == len(session['steps']):
            result_message = '排序正確！'
            happyending = True
        elif session['current_step'] != len(session['steps']):
            result_message = '步驟正確，請繼續~'
    elif expected_hand and user_hand == expected_hand:
        result_message = '步驟正確，請繼續~'
        session['current_step'] += 1
    else:
        result_message = '步驟錯誤，去重來！'

    print("happyending",happyending);

    return jsonify({
        'result': result_message,
        'expected_hand': expected_hand, #正確應該是
        'user_moves': session['user_moves'], #使用者移動紀錄
        'current_step': session['current_step'], #目前步驟數
        'steps_items': session['steps_items'], #各步驟選項
        'atlast_answer': session['sorted_hand'],
        'happyending': happyending,
        'user_hand': user_hand
    })

if __name__ == '__main__':
    app.run(debug=True)
