document.addEventListener('DOMContentLoaded', () => {
    const cardsContainer = document.getElementById('cards-container');
    const messageDiv = document.getElementById('message');
    let selectedCards = []; // 用於存儲被選擇的兩張牌
    


    // 初始化 Sortable
    new Sortable(cardsContainer, {
        animation: 150,
        onEnd: function (event) {
            // 當用戶移動牌時自動檢查排序狀態
            checkSortStatus();
        }
    });

     // 確保卡片元素存在
     const cards = document.querySelectorAll('.card');
     console.log("aaaaaaaa",cards,"bbb");  // 確認選擇到卡片

    // 為每張卡片添加點擊事件
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function() {
            // 確保不選擇重複的牌
            if (selectedCards.length < 2 && !selectedCards.includes(card)) {
                selectedCards.push(card); // 將點擊的牌加入已選擇的牌
                card.classList.add('selected'); // 標記為選擇狀態
                
                if (selectedCards.length === 2) {
                    // 當選擇了兩張牌後，檢查排序
                    checkSelectedCards(selectedCards[0], selectedCards[1]);

                    // 立即檢查排序狀態
                    checkSortStatus();

                    // 清空已選擇的牌
                    selectedCards.forEach(selectedCard => {
                        selectedCard.classList.remove('selected'); // 清除標記
                    });
                    selectedCards = []; // 重置已選擇的牌
                }
            }
        });
    });

    // 檢查排序狀態的函數
    function checkSortStatus() {
        const currentHand = Array.from(document.querySelectorAll('.card'))
            .map(card => card.textContent.trim());

        fetch('/check_sort', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ hand: currentHand })
        })
        .then(response => response.json())
        .then(data => {
            messageDiv.innerText = data.result;
            updateUserMoves(data.user_moves);
            
            // 如果排序正確，隱藏卡片容器
            if (!data.result.includes('繼續')) {
                cardsContainer.style.display = 'none';
            } else {
                cardsContainer.style.display = 'flex';
            }
        });
    }

    // 檢查選擇的兩張卡片的排序
    function checkSelectedCards(card1, card2) {
        const currentHand = Array.from(document.querySelectorAll('.card'))
            .map(card => card.textContent.trim());
        
        const index1 = currentHand.indexOf(card1.innerText.trim());
        const index2 = currentHand.indexOf(card2.innerText.trim());

        // 假設正確的排序為從大到小
        if (index1 > index2) {
            card1.classList.add('error'); // 錯誤的顏色
            card2.classList.add('correct'); // 正確的顏色
        } else if (index1 < index2) {
            card1.classList.add('correct'); // 正確的顏色
            card2.classList.add('error'); // 錯誤的顏色
        } else {
            // 相同的情況
            card1.classList.remove('correct', 'error');
            card2.classList.remove('correct', 'error');
        }
    }

    // 更新用戶移動顯示
    function updateUserMoves(userMoves) {
        const movesContainer = document.getElementById('user-moves');
        movesContainer.innerHTML = '';

        userMoves.forEach((move) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'step';

            move.cards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card step-card';
                cardDiv.textContent = card;
                stepDiv.appendChild(cardDiv);
            });

            const statusDiv = document.createElement('span');
            statusDiv.textContent = move.correct ? "success" : "error";
            stepDiv.appendChild(statusDiv);
            movesContainer.appendChild(stepDiv);
        });
    }
    
    function drag(event) {
    event.dataTransfer.setData("text", event.target.innerHTML);
    event.target.style.cursor = 'grabbing'; // 鼠標按下時改為 grabbing
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    var cardsContainer = document.getElementById("cards-container");
    var draggedCard = Array.from(cardsContainer.children).find(card => card.innerHTML === data);
    var targetCard = event.target;

    if (targetCard.classList.contains("card") && targetCard !== draggedCard) {
        // 交換卡片
        var temp = targetCard.innerHTML;
        targetCard.innerHTML = draggedCard.innerHTML;
        draggedCard.innerHTML = temp;

        // 記錄最後移動的卡牌
        lastMovedCards.push([draggedCard.innerText.trim(), targetCard.innerText.trim()]);

        // 自動檢查排序狀態
        checkSortStatus();  // 這裡呼叫檢查排序的函數
    }

    draggedCard.style.cursor = 'grab'; // 放開時改回 grab
}

    

    
    

    // 添加 CSS 樣式來標記選擇的牌
    const style = document.createElement('style');
    style.innerHTML = `
        .selected {
            border: 2px solid blue; /* 用藍色邊框標記選擇的牌 */
        }
        .correct {
            background-color: #c8e6c9; /* 綠色背景 */
        }
        .error {
            background-color: #ffcdd2; /* 紅色背景 */
        }
    `;
    document.head.appendChild(style);
});
