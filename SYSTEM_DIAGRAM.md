# Forest Guardian Platformer - System Architecture Diagram

## Game Flow Diagram

```mermaid
graph TD
    A[Game Start] --> B[PreloadScene]
    B --> C[MenuScene]
    C --> D[GameScene]
    D --> E{Player Action}
    
    E --> F[Movement System]
    E --> G[Combat System]
    E --> H[Collection System]
    E --> I[Puzzle System]
    
    F --> J[Physics Engine]
    G --> K[Enemy AI]
    H --> L[Ability Unlock]
    I --> M[Environmental Objects]
    
    J --> N[Collision Detection]
    K --> O[Damage System]
    L --> P[Player Abilities]
    M --> Q[Level Progression]
    
    N --> R{Game State Check}
    O --> R
    P --> R
    Q --> R
    
    R --> S[Player Death] 
    R --> T[Level Complete]
    R --> U[Continue Playing]
    
    S --> V[GameOverScene]
    T --> W[VictoryScene]
    U --> E
    
    V --> C
    W --> C
```

## Core Systems Architecture

```mermaid
graph LR
    subgraph "Input Layer"
        A[Keyboard Input]
        B[Touch Input]
    end
    
    subgraph "Game Logic Layer"
        C[Input Manager]
        D[Player Controller]
        E[Enemy AI System]
        F[Physics System]
        G[Audio Manager]
        H[Save System]
    end
    
    subgraph "Rendering Layer"
        I[Scene Manager]
        J[Sprite Renderer]
        K[Parallax System]
        L[Particle System]
        M[UI System]
    end
    
    A --> C
    B --> C
    C --> D
    C --> E
    D --> F
    E --> F
    F --> I
    G --> I
    H --> I
    I --> J
    I --> K
    I --> L
    I --> M
```

## Player Ability System Flow

```mermaid
stateDiagram-v2
    [*] --> BasicMovement
    BasicMovement --> Jumping: Space Key
    Jumping --> BasicMovement: Land
    
    BasicMovement --> DoubleJumpUnlocked: Collect 5 Gems
    DoubleJumpUnlocked --> DoubleJumping: Space Key (in air)
    DoubleJumping --> BasicMovement: Land
    
    DoubleJumpUnlocked --> DashUnlocked: Collect 10 Gems
    DashUnlocked --> Dashing: Shift Key
    Dashing --> DashCooldown: Dash Complete
    DashCooldown --> DashUnlocked: Cooldown Timer
```

## Enemy AI Behavior Tree

```mermaid
graph TD
    A[Enemy Update] --> B{Player in Range?}
    B -->|Yes| C{Enemy Type}
    B -->|No| D[Patrol Behavior]
    
    C -->|Woodland Sprite| E[Flying Chase]
    C -->|Root Crawler| F[Ground Pursuit]
    C -->|Thorn Beast| G[Aggressive Attack]
    
    E --> H[Move Toward Player]
    F --> I[Pathfind to Player]
    G --> J[Charge Attack]
    
    H --> K{Collision Check}
    I --> K
    J --> K
    
    K -->|Hit Player| L[Deal Damage]
    K -->|Hit Wall| M[Change Direction]
    K -->|No Collision| N[Continue Movement]
    
    D --> O[Move Along Path]
    O --> P{Reached Waypoint?}
    P -->|Yes| Q[Next Waypoint]
    P -->|No| R[Continue Patrol]
    
    L --> A
    M --> A
    N --> A
    Q --> A
    R --> A
```

## Level Progression System

```mermaid
graph LR
    A[Tutorial Area] --> B[Basic Platforming]
    B --> C[Enemy Introduction]
    C --> D[First Gem Collection]
    D --> E[Double Jump Unlock]
    E --> F[Advanced Platforming]
    F --> G[Environmental Puzzles]
    G --> H[More Gems Collection]
    H --> I[Dash Ability Unlock]
    I --> J[Complex Challenges]
    J --> K[Boss Arena]
    K --> L[Victory]
```

## Asset Loading Pipeline

```mermaid
graph TD
    A[Game Start] --> B[PreloadScene Initialize]
    B --> C[Load Sprite Sheets]
    C --> D[Load Audio Files]
    D --> E[Load Level Data]
    E --> F[Load UI Assets]
    F --> G[Create Animations]
    G --> H[Initialize Audio]
    H --> I[Setup Physics]
    I --> J[Ready to Play]
    J --> K[Transition to Menu]
```

## Save System Data Flow

```mermaid
graph LR
    A[Player Progress] --> B[Save Data Object]
    B --> C{Save Trigger}
    
    C -->|Checkpoint| D[Auto Save]
    C -->|Gem Collection| E[Progress Save]
    C -->|Ability Unlock| F[Ability Save]
    C -->|Level Complete| G[Level Save]
    
    D --> H[Local Storage]
    E --> H
    F --> H
    G --> H
    
    H --> I[Data Persistence]
    I --> J[Load on Game Start]
    J --> K[Restore Player State]
```

This visual representation helps understand how all the game systems interconnect and flow together to create the complete platformer experience.