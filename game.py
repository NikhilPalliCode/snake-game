import pygame
import random
import time

# Initialize pygame
pygame.init()

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)

# Game settings
WIDTH, HEIGHT = 600, 400
BLOCK_SIZE = 20
FPS = 10

# Set up display
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption('Simple Snake Game')

clock = pygame.time.Clock()
font = pygame.font.SysFont('Arial', 25)

def draw_grid():
    for x in range(0, WIDTH, BLOCK_SIZE):
        for y in range(0, HEIGHT, BLOCK_SIZE):
            rect = pygame.Rect(x, y, BLOCK_SIZE, BLOCK_SIZE)
            pygame.draw.rect(screen, (50, 50, 50), rect, 1)

def game_loop():
    # Initial snake position (list of blocks)
    snake = [[WIDTH//2, HEIGHT//2]]
    snake_direction = [BLOCK_SIZE, 0]
    
    # Initial food position
    food = [
        random.randrange(0, WIDTH - BLOCK_SIZE, BLOCK_SIZE),
        random.randrange(0, HEIGHT - BLOCK_SIZE, BLOCK_SIZE)
    ]
    
    score = 0
    game_over = False
    
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                return
            
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP and snake_direction[1] != BLOCK_SIZE:
                    snake_direction = [0, -BLOCK_SIZE]
                if event.key == pygame.K_DOWN and snake_direction[1] != -BLOCK_SIZE:
                    snake_direction = [0, BLOCK_SIZE]
                if event.key == pygame.K_LEFT and snake_direction[0] != BLOCK_SIZE:
                    snake_direction = [-BLOCK_SIZE, 0]
                if event.key == pygame.K_RIGHT and snake_direction[0] != -BLOCK_SIZE:
                    snake_direction = [BLOCK_SIZE, 0]
                if event.key == pygame.K_r and game_over:
                    return game_loop()
        
        if game_over:
            continue
        
        # Move snake
        new_head = [snake[0][0] + snake_direction[0], snake[0][1] + snake_direction[1]]
        snake.insert(0, new_head)
        
        # Check if snake ate food
        if snake[0] == food:
            score += 1
            food = [
                random.randrange(0, WIDTH - BLOCK_SIZE, BLOCK_SIZE),
                random.randrange(0, HEIGHT - BLOCK_SIZE, BLOCK_SIZE)
            ]
            # Make sure food doesn't spawn on snake
            while food in snake:
                food = [
                    random.randrange(0, WIDTH - BLOCK_SIZE, BLOCK_SIZE),
                    random.randrange(0, HEIGHT - BLOCK_SIZE, BLOCK_SIZE)
                ]
        else:
            snake.pop()
        
        # Check collisions
        if (snake[0][0] < 0 or snake[0][0] >= WIDTH or
            snake[0][1] < 0 or snake[0][1] >= HEIGHT or
            snake[0] in snake[1:]):
            game_over = True
        
        # Draw everything
        screen.fill(BLACK)
        draw_grid()
        
        # Draw snake
        for block in snake:
            pygame.draw.rect(screen, GREEN, (block[0], block[1], BLOCK_SIZE, BLOCK_SIZE))
        
        # Draw food
        pygame.draw.rect(screen, RED, (food[0], food[1], BLOCK_SIZE, BLOCK_SIZE))
        
        # Draw score
        score_text = font.render(f'Score: {score}', True, WHITE)
        screen.blit(score_text, (10, 10))
        
        if game_over:
            game_over_text = font.render('Game Over! Press R to restart', True, WHITE)
            screen.blit(game_over_text, (WIDTH//2 - 150, HEIGHT//2))
        
        pygame.display.update()
        clock.tick(FPS)

# Start the game
game_loop()