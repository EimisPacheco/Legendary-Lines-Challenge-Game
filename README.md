## Inspiration  
I’ve always loved trivia games that challenge your memory and knowledge of famous quotes and phrases. I wanted to take that concept further by using AI to generate fresh, dynamic challenges. The idea was to create something fun that tests your memory in categories you enjoy—whether that’s music, movies, books, or even poetry.

See video: https://vimeo.com/1070418341


![Legendary-Main-Page](https://github.com/user-attachments/assets/a6ef4111-8a8b-448d-bdcb-10b443ee374a)

![Legendary1](https://github.com/user-attachments/assets/be97d2f7-482c-4a97-8878-249d09ca526f)

![Legendary2](https://github.com/user-attachments/assets/978a545c-1a20-427e-a264-0bb79eb62b7f)



## What it does  
**Legendary Lines Game** is an AI-powered trivia game where players try to guess the source of iconic phrases. Bonus points are awarded for guessing the **year** the quote was said, and even more for guessing the **director (for movies), artist/band (for songs), or author (for books)**. But be careful—wrong answers mean losing points!

Categories include songs, movies, famous people, fictional characters, books, and more. Harder categories like books give higher points, since they're usually tougher to recall. This makes the game more rewarding and challenging at the same time.

## How we built it  
The frontend is built in **React** for a smooth, modern experience. The backend uses:

- **Azure Functions** to handle game logic and API requests  
- **Azure API Management** to route and manage those requests  
- **Azure Blob Storage** to store game assets like quotes, sounds, and icons  
- **Azure OpenAI (GPT-4)** to generate trivia phrases and hints  
- **GitHub Copilot and GitHub Copilot Azure** to help with writing dynamic game logic and speeding up development (especially helpful since I’m mainly a Python developer, not a React/JS expert) and other useful vs code extensions.

![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/extension1.png)
![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/extension2.png)
![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/extension3.png)
![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/extension4.png)
![Alt text](https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/azure-architecture-game-resources/extension5.png)

This setup keeps the game lightweight, scalable, and responsive.

## Challenges we ran into  
One of the big challenges was keeping the **AI-generated quotes relevant and fair**—some GPT-4o responses were too obscure or out of context. I had to fine-tune prompts and add validation checks. Also, optimizing **Azure Functions** to respond quickly without timing out was important, especially with multiple API calls per round. Making Q Developer feel natural and responsive took a few experiments too.

## Accomplishments that we're proud of  
I'm really proud of how **seamless and fun** the game feels! The mix of tech and gameplay creates a smooth, immersive experience. Getting **Azure Functions, Blob Storage, and API Management** to work together reliably was a win. Also, making the scoring system flexible and the categories dynamic gave it replay value and helped balance challenge with fun.

## What we learned  
I learned a lot about designing fast and efficient **Azure Functions**, especially how to keep them responsive and low-cost. I also got better at crafting prompts for **Azure OpenAI** and understanding how to guide GPT-4 for better trivia generation. Working with **Microsoft Q Developer** was a big help—it made the logic more dynamic and helped me bring this idea to life quickly.

## What's next for Legendary Lines Game  
Next steps include:

- Adding **multiplayer support**, so players can challenge friends  
- Live **leaderboards** for global competition  
- Custom game modes where players submit their favorite lines  
- AI-powered **adaptive difficulty** based on player history  
- New categories like **historical speeches, internet memes, and regional slang**
