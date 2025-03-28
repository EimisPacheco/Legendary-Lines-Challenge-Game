// No need to import CosmosClient anymore
class CosmosDBService {
    constructor() {
        // Define the function URLs - update with your actual URLs
        this.saveScoreUrl = process.env.REACT_APP_FUNCTION_SAVE_SCORE_URL;
        this.getLeaderboardUrl = process.env.REACT_APP_FUNCTION_LEADERBOARD_URL;
        
        // Use localStorage in development
        this.useLocalStorage = process.env.NODE_ENV === 'development' && 
                               (!this.saveScoreUrl || !this.getLeaderboardUrl);
        
        console.log('🔧 CosmosDBService initialized with:');
        console.log(`  - Save Score URL: ${this.saveScoreUrl || 'Not configured'}`);
        console.log(`  - Leaderboard URL: ${this.getLeaderboardUrl || 'Not configured'}`);
        console.log(`  - Using localStorage: ${this.useLocalStorage}`);
        
        if (this.useLocalStorage) {
            console.warn("⚠️ Using localStorage for score storage during development");
        } else if (!this.saveScoreUrl || !this.getLeaderboardUrl) {
            console.warn("⚠️ Azure Functions URLs not configured - using mock data");
        } else {
            console.log("✅ Azure Functions API initialized successfully");
        }
    }

    async saveGameScore(nickname, gameType, score, metadata = {}) {
        console.log('📤 SAVE SCORE REQUEST:');
        console.log(`  - Nickname: ${nickname}`);
        console.log(`  - Game Type: ${gameType}`);
        console.log(`  - Score: ${score}`);
        console.log(`  - Metadata:`, metadata);
        
        // Use localStorage in development
        if (this.useLocalStorage) {
            console.log(`💾 [LocalStorage] Saving score: ${nickname}, ${gameType}, ${score}`);
            const timestamp = new Date().toISOString();
            const scoreData = {
                id: `${nickname}_${gameType}_${timestamp}`,
                nickname,
                gameType,
                score,
                timestamp,
                ...metadata
            };
            
            const existingScores = JSON.parse(localStorage.getItem('gameScores') || '[]');
            existingScores.push(scoreData);
            localStorage.setItem('gameScores', JSON.stringify(existingScores));
            
            console.log("✅ Score saved to localStorage:", scoreData);
            return scoreData;
        }
        
        // Use function API in production
        if (!this.saveScoreUrl) {
            console.log(`⚠️ [Mock API] Would save score: ${nickname}, ${gameType}, ${score}`);
            return { id: "mock-id", success: false, message: "Function API not configured" };
        }
        
        try {
            const timestamp = new Date().toISOString();
            const scoreData = {
                nickname,
                gameType,
                score,
                timestamp,
                metadata
            };
            
            console.log(`🔄 Calling Azure Function at: ${this.saveScoreUrl}`);
            console.log(`📦 Request payload:`, JSON.stringify(scoreData, null, 2));
            
            const response = await fetch(this.saveScoreUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(scoreData)
            });
            
            console.log(`🔄 Response status: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log(`✅ Successfully saved score. Response:`, result);
            return result;
        } catch (error) {
            console.error("❌ Error saving score to Function API:", error);
            console.error("  - Error details:", error.message);
            console.error("  - Stack trace:", error.stack);
            return { id: "error-id", success: false, error: error.message };
        }
    }

    async getLeaderboard(gameType, limit = 5) {
        console.log('📥 GET LEADERBOARD REQUEST:');
        console.log(`  - Game Type: ${gameType}`);
        console.log(`  - Limit: ${limit}`);
        
        // Use localStorage in development
        if (this.useLocalStorage) {
            console.log(`💾 [LocalStorage] Getting leaderboard for: ${gameType}`);
            const allScores = JSON.parse(localStorage.getItem('gameScores') || '[]');
            const leaderboard = allScores
                .filter(score => score.gameType === gameType)
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);
            
            console.log("✅ Leaderboard from localStorage:", leaderboard);
            return leaderboard;
        }
        
        // Use function API in production
        if (!this.getLeaderboardUrl) {
            console.log(`⚠️ [Mock API] Would get leaderboard for: ${gameType}`);
            return [{ nickname: "Example", score: 100, timestamp: new Date().toISOString() }];
        }
        
        try {
            const url = `${this.getLeaderboardUrl}&gameType=${encodeURIComponent(gameType)}&limit=${limit}`;
            console.log(`🔄 Calling Azure Function at: ${url}`);
            
            const response = await fetch(url);
            console.log(`🔄 Response status: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✅ Leaderboard retrieved. Response:`, data);
            return data;
        } catch (error) {
            console.error("❌ Error retrieving leaderboard from Function API:", error);
            console.error("  - Error details:", error.message);
            console.error("  - Stack trace:", error.stack);
            return [];
        }
    }
}

export default new CosmosDBService(); 