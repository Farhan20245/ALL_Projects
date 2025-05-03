import tkinter as tk
from tkinter import messagebox

def check_winner():
    for row in board:
        if row[0]["text"] == row[1]["text"] == row[2]["text"] != "":
            return row[0]["text"]
    
    for col in range(3):
        if board[0][col]["text"] == board[1][col]["text"] == board[2][col]["text"] != "":
            return board[0][col]["text"]
    
    if board[0][0]["text"] == board[1][1]["text"] == board[2][2]["text"] != "":
        return board[0][0]["text"]
    
    if board[0][2]["text"] == board[1][1]["text"] == board[2][0]["text"] != "":
        return board[0][2]["text"]
    
    return None

def is_board_full():
    return all(board[row][col]["text"] != "" for row in range(3) for col in range(3))

def minimax(is_maximizing):
    winner = check_winner()
    if winner == "X":
        return -1
    elif winner == "O":
        return 1
    elif is_board_full():
        return 0
    
    if is_maximizing:
        best_score = -float("inf")
        for row in range(3):
            for col in range(3):
                if board[row][col]["text"] == "":
                    board[row][col]["text"] = "O"
                    score = minimax(False)
                    board[row][col]["text"] = ""
                    best_score = max(score, best_score)
        return best_score
    else:
        best_score = float("inf")
        for row in range(3):
            for col in range(3):
                if board[row][col]["text"] == "":
                    board[row][col]["text"] = "X"
                    score = minimax(True)
                    board[row][col]["text"] = ""
                    best_score = min(score, best_score)
        return best_score

def best_ai_move():
    best_score = -float("inf")
    move = None
    for row in range(3):
        for col in range(3):
            if board[row][col]["text"] == "":
                board[row][col]["text"] = "O"
                score = minimax(False)
                board[row][col]["text"] = ""
                if score > best_score:
                    best_score = score
                    move = (row, col)
    if move:
        board[move[0]][move[1]]["text"] = "O"
        animate_move(move[0], move[1], "O")

def restart_game():
    global current_player
    current_player = "X"
    for row in range(3):
        for col in range(3):
            board[row][col]["text"] = ""
            canvases[row][col].delete("all")

def set_mode(selected_mode):
    global mode
    mode = selected_mode
    mode_label.config(text=f"Mode: {mode}")
    restart_game()

def show_mode_selection():
    global mode
    mode = "User  vs User"
    selection_window = tk.Toplevel(root)
    selection_window.title("Select Mode")
    tk.Button(selection_window, text="User  vs User", command=lambda: set_mode("User  vs User")).pack()
    tk.Button(selection_window, text="User  vs AI", command=lambda: set_mode("User  vs AI")).pack()

def animate_circle(canvas, x, y, r, step):
    if step <= 360:
        canvas.create_arc(x - r, y - r, x + r, y + r, start=0, extent=step, outline="blue", width=5)
        root.after(10, animate_circle, canvas, x, y, r, step + 10)

def animate_cross(canvas, x1, y1, x2, y2, step):
    if step <= 1:
        canvas.create_line(x1, y1, x1 + (x2 - x1) * step, y1 + (y2 - y1) * step, fill="red", width=5)
        canvas.create_line(x2, y1, x2 - (x2 - x1) * step, y1 + (y2 - y1) * step, fill="red", width=5)
        root.after(10, animate_cross, canvas, x1, y1, x2, y2, step + 0.05)

def animate_move(row, col, player):
    canvas = canvases[row][col]
    canvas.delete("all")
    if player == "O":
        animate_circle(canvas, 50, 50, 40, 0)
    elif player == "X":
        animate_cross(canvas, 10, 10, 90, 90, 0)

def update_score(winner):
    if winner == "X":
        scores["User  1"] += 1
    elif winner == "O":
        scores["AI"] += 1
    score_label.config(text=f"User  1: {scores['User  1']} | AI: {scores['AI']} | User 2: {scores['User  2']}")

root = tk.Tk()
root.title("Tic Tac Toe: A Decisive Game for Survival")

current_player = "X"
mode = "User  vs User"
board = [[None] * 3 for _ in range(3)]
canvases = [[None] * 3 for _ in range(3)]
scores = {"User  1": 0, "AI": 0, "User  2": 0}

# Configure all rows and columns to have equal weight
for i in range(6):  # Rows 0 to 5
    root.grid_rowconfigure(i, weight=1)
for i in range(3):  # Columns 0 to 2
    root.grid_columnconfigure(i, weight=1)

# Create the Tic-Tac-Toe grid using Canvas
for row in range(3):
    for col in range(3):
        canvas = tk.Canvas(root, width=100, height=100, bg="white", highlightthickness=1, highlightbackground="black")
        canvas.grid(row=row, column=col, padx=5, pady=5, sticky="nsew")
        canvas.bind("<Button-1>", lambda event, r=row, c=col: on_click(r, c))
        canvases[row][col] = canvas
        board[row][col] = {"text": ""}

# Restart button
tk.Button(root, text="Restart", command=restart_game, font=("Arial", 14)).grid(row=3, column=0, columnspan=2, sticky="nsew")

# Mode label
mode_label = tk.Label(root, text=f"Mode: {mode}", font=("Arial", 14))
mode_label.grid(row=3, column=2, sticky="nsew")

# Score label
score_label = tk.Label(root, text=f"User  1: {scores['User  1']} | AI: {scores['AI']} | User 2: {scores['User  2']}", font=("Arial", 14))
score_label.grid(row=4, column=0, columnspan=3, sticky="nsew")

# Change Mode button
tk.Button(root, text="Change Mode", command=show_mode_selection, font=("Arial", 14)).grid(row=5, column=0, columnspan=3, sticky="nsew")

# Exit button
tk.Button(root, text="Exit", command=root.quit, font=("Arial", 14)).grid(row=6, column=0, columnspan=3, sticky="nsew")

def on_click(row, col):
    global current_player, mode
    if board[row][col]["text"] == "":
        board[row][col]["text"] = current_player
        animate_move(row, col, current_player)
        winner = check_winner()
        if winner:
            update_score(winner)
            if messagebox.askyesno("Game Over", f"{winner} wins! Play again?"):
                restart_game()
            else:
                root.quit()
        elif is_board_full():
            if messagebox.askyesno("Game Over", "It's a draw! Play again?"):
                restart_game()
            else:
                root.quit()
        else:
            if mode == "User  vs AI" and current_player == "X":
                current_player = "O"
                ai_thinking_label = tk.Label(root, text="AI is thinking...", font=("Arial", 14), fg="red")
                ai_thinking_label.grid(row=7, column=0, columnspan=3, sticky="nsew")
                root.update()
                root.after(500)  # Simulate AI thinking time
                best_ai_move()
                ai_thinking_label.destroy()
                winner = check_winner()
                if winner:
                    update_score(winner)
                    if messagebox.askyesno("Game Over", f"{winner} wins! Play again?"):
                        restart_game()
                    else:
                        root.quit()
                elif is_board_full():
                    if messagebox.askyesno("Game Over", "It's a draw! Play again?"):
                        restart_game()
                    else:
                        root.quit()
                current_player = "X"
            else:
                current_player = "O" if current_player == "X" else "X"

restart_game()
show_mode_selection()
root.mainloop()