import { resolveRelativePath } from "@shared/lib/pathResolver";
import { storageManager } from "@shared/lib/storage";

import type { FileSystemNode } from "../types";

let currentDirectory = "/home/user";

const FILESYSTEM_STORAGE_KEY = "cyberpunk_filesystem";
const CURRENT_DIR_STORAGE_KEY = "cyberpunk_current_dir";

const defaultFileSystem: Record<string, FileSystemNode> = {
  "/home/user": {
    type: "dir",
    contents: {
      documents: {
        type: "dir",
        contents: {
          "notes.txt": {
            type: "file",
            content:
              "[2077-03-15 14:23] First Entry\nStarted investigating NeoCorp activities.\nSomething's wrong with their new 'Alpha' project.\n\n[2077-03-16 09:45] Anomaly Detected\nNetwork scan showed strange activity\non server 192.168.1.100. Need to investigate.\n\n[2077-03-17 22:10] Breakthrough!\nHacked into NeoCorp server. Found encrypted files.\nNeed to find a way to decrypt them.\n\n[2077-03-18 11:30] Password Discovery\nFound admin credentials for 192.168.1.42:\nAdmin always uses simple passwords: ADMIN + numbers\nPattern: ADMIN123 (8 chars, uppercase + digits)",
          },
          "contacts.txt": {
            type: "file",
            content:
              'HACKER CONTACTS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nLAIN\n  Handle: @lain_iwakura\n  Status: Connected to Wired\n  Specialty: Reality manipulation\n  Last seen: Present everywhere, Present nowhere\n  Note: "Present day, present time. HAHAHAHA."\n  WARNING: Do not attempt to understand. Present it.\n\nV\n  Handle: @v_nomad\n  Status: Active\n  Specialty: Netrunning & Solo operations\n  Last seen: 2077-12-10\n  Location: Night City\n  Note: Former streetkid, now legend. Has engram of Johnny Silverhand.\n\nJOHNNY\n  Handle: @silverhand_2077\n  Status: ENGRAM (Active in V\'s head)\n  Specialty: Rockerboy, revolutionary\n  Last seen: 2023 (original), 2077 (as engram)\n  Note: "Wake the fuck up, samurai. We have a city to burn."\n  WARNING: Unstable engram, may cause personality conflicts\n\nJUDY\n  Handle: @judy_alvarez\n  Status: Active\n  Specialty: Braindance editing, netrunning\n  Last seen: 2077-12-15\n  Location: Night City (Pacifica)\n  Note: Best BD editor in NC. Trustworthy, but watch for Mox connections.\n\nKILLY\n  Handle: @killy_seeker\n  Status: Wandering\n  Specialty: Gravitational Beam Emitter, survival\n  Last seen: Unknown (time dilation active)\n  Location: The City (possibly Earth, possibly future)\n  Note: Searching for Net Terminal Genes. Has been traveling for 3000+ years.\n  WARNING: Do not interfere with mission. Extremely dangerous.\n\nCIBO\n  Handle: @cibo_researcher\n  Status: UNKNOWN (last seen with Killy)\n  Specialty: Genetic research, Net Terminal access\n  Last seen: Unknown\n  Location: The City, deep levels\n  Note: Former Safeguard scientist. May have Net Terminal Genes.\n  WARNING: Status uncertain after last contact with Safeguard',
          },
        },
      },
      projects: {
        type: "dir",
        contents: {
          "virus_prototype.asm": {
            type: "file",
            content:
              "; VIRUS PROTOTYPE - DO NOT EXECUTE\n; Author: Unknown\n; Date: 2077-03-10\n\nsection .text\n    global _start\n\n_start:\n    ; Self-replication code\n    ; WARNING: This is experimental\n    ; Use at your own risk\n\n    mov eax, 1\n    int 0x80",
          },
          "exploit_framework.c": {
            type: "file",
            content:
              '/* EXPLOIT FRAMEWORK v2.0 */\n/* Framework for testing vulnerabilities */\n\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Buffer overflow test\n    char buffer[64];\n    printf("Testing buffer overflow...\\n");\n    \n    // SQL injection test\n    printf("Testing SQL injection...\\n");\n    \n    return 0;\n}',
          },
        },
      },
      secrets: {
        type: "dir",
        contents: {},
      },
      music: {
        type: "dir",
        contents: {
          "metadata.json": {
            type: "file",
            content:
              '{\n  "tracks": [\n    {\n      "filename": "mothra.wav",\n      "title": "mothra.wav",\n      "artist": "happyalready",\n      "duration": 56,\n      "format": "wav"\n    },\n    {\n      "filename": "shadowprotocol-darkambientdrone-morbid-mix.ogg",\n      "title": "shadowprotocol-darkambientdrone-morbid-mix.ogg",\n      "artist": "glitchart",\n      "duration": 128,\n      "format": "ogg"\n    }\n  ]\n}',
          },
          "mothra.wav": {
            type: "file",
            content:
              "[BINARY AUDIO FILE]\n\nFile: mothra.wav\nFormat: WAV\nArtist: happyalready\nDuration: 56 seconds\n\nThis is a binary audio file.\nUse the music player to play it.\n\nTo play: music open, then 'play mothra.wav'",
          },
          "shadowprotocol-darkambientdrone-morbid-mix.ogg": {
            type: "file",
            content:
              "[BINARY AUDIO FILE]\n\nFile: shadowprotocol-darkambientdrone-morbid-mix.ogg\nFormat: OGG\nArtist: glitchart\nDuration: 128 seconds\n\nThis is a binary audio file.\nUse the music player to play it.\n\nTo play: music open, then 'play shadowprotocol-darkambientdrone-morbid-mix.ogg'",
          },
          "player.exe": {
            type: "file",
            content:
              "MUSIC PLAYER APPLICATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] Music Player v1.0\n[2077-03-20] Author: Cyberpunk Terminal Team\n[2077-03-20] Classification: MEDIA PLAYER\n\nThis is the music player executable.\n\nTo run:\n  open player.exe\n  or\n  ./music/player.exe\n\nFeatures:\n  - 8-bit music playback\n  - ASCII visualization\n  - Terminal-based interface\n  - Support for OGG and WAV formats\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          },
        },
      },
      mail: {
        type: "dir",
        contents: {
          "mail.exe": {
            type: "file",
            content:
              "EMAIL CLIENT APPLICATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] Email Client v1.0\n[2077-03-20] Author: Cyberpunk Terminal Team\n[2077-03-20] Classification: COMMUNICATION INTERFACE\n\nThis is the Email Client executable.\nA secure terminal-based email client for Wired communications.\n\nTo run:\n  open mail.exe\n  or\n  ./mail/mail.exe\n  or\n  mail\n\nFeatures:\n  - Secure encrypted messaging\n  - Terminal-based interface\n  - Wired network integration\n  - Message filtering and search\n  - Contact management\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNETWORK STATUS: CONNECTED\nENCRYPTION: E2EE (End-to-End Encrypted)\nPROTOCOL: Wired Mail Protocol v2.0\n\nAll messages are encrypted using military-grade algorithms.\nYour communications are secure, but remember:\nin the Wired, nothing is truly private.\n\nSome messages may contain hidden data or viruses.\nAlways scan attachments before opening.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nKNOWN ISSUES:\n- Messages from @lain_iwakura may cause reality glitches\n- Time-stamped messages from the future are not supported\n- Neural interface interference may corrupt message headers\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          },
        },
      },
      games: {
        type: "dir",
        contents: {
          snake: {
            type: "dir",
            contents: {
              "snake.exe": {
                type: "file",
                content:
                  "SNAKE GAME APPLICATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] Snake Game v1.0\n[2077-03-20] Author: Cyberpunk Terminal Team\n[2077-03-20] Classification: NEURAL INTERFACE TRAINING\n\nThis is the Snake Game executable.\nA neural interface training program disguised as a game.\n\nTo run:\n  open snake.exe\n  or\n  ./games/snake/snake.exe\n  or\n  snake\n\nFeatures:\n  - ASCII-based visualization\n  - Adaptive difficulty system\n  - Obstacle mode for advanced training\n  - High score tracking\n  - Terminal-based interface\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNEURAL INTERFACE STATUS: ACTIVE\nTRAINING MODE: ENABLED\n\nEach point you score strengthens your connection\nto the Wired. Each level brings you closer to...\n\nBut remember: in the real world, there are no restarts.\nEvery mistake has consequences.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
              },
              "highscores.dat": {
                type: "file",
                content:
                  'GAME HIGH SCORES DATABASE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] High Scores Log\n[2077-03-20] Format: Binary (JSON encoded)\n[2077-03-20] Classification: NEURAL INTERFACE DATA\n\nThis file contains encrypted high score data for all games.\nScores are automatically updated when you achieve new records.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nENCRYPTION: AES-256\nSTATUS: ACTIVE\nLOCATION: LocalStorage (browser)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[DECRYPTED RECORDS - SNAKE GAME]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1.  @lain_iwakura          - 999 points (Level 99, hard, obstacles)\n   Date: 2077-03-15 23:59:59\n   Note: "Present day, present time. HAHAHAHA."\n   Status: Connected to Wired\n\n2.  @killy_seeker           - 847 points (Level 84, hard, obstacles)\n   Date: 2077-03-10 12:30:15\n   Note: "Net Terminal Genes activated. Pattern recognition: optimal."\n   Status: Wandering (time dilation active)\n\n3.  @v_nomad                - 623 points (Level 62, medium, obstacles)\n   Date: 2077-12-10 18:45:22\n   Note: "Johnny says I\'m getting better. Still not as good as him."\n   Status: Active in Night City\n\n4.  @silverhand_2077        - 512 points (Level 51, medium, classic)\n   Date: 2023-11-16 20:20:20\n   Note: "Wake the fuck up, samurai. We have a city to burn."\n   Status: ENGRAM (Active in V\'s head)\n\n5.  @judy_alvarez           - 456 points (Level 45, medium, obstacles)\n   Date: 2077-12-15 14:20:10\n   Note: "BD editing skills translate well to pattern recognition."\n   Status: Active in Pacifica\n\n6.  @cibo_researcher        - 389 points (Level 38, medium, obstacles)\n   Date: Unknown (time dilation active)\n   Note: "Genetic research patterns help with neural interface training."\n   Status: UNKNOWN (last seen with Killy)\n\n7.  user@cyberpunk          - 247 points (Level 24, easy, classic)\n   Date: 2077-03-18 03:33:33\n   Note: "Strange... I don\'t remember playing this game."\n   Status: ??? ACTIVE ???\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nANOMALY DETECTED\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nEntry #7 (user@cyberpunk) shows activity from 2077-03-18,\nbut system logs indicate no game sessions on that date.\n\nPossible explanations:\n- Data corruption\n- Time synchronization error\n- Unauthorized access\n- Neural interface interference\n\nInvestigation required.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nENCRYPTION KEY HINT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nThe highest score belongs to @lain_iwakura.\nHer message contains a pattern: "Present day, present time."\n\nIf you can decode this pattern, you might find something...\nBut remember: in the Wired, nothing is as it seems.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTo view your current scores:\n  - In Snake Game: type \'scores\' command\n  - Or check game-specific commands\n\nNote: Scores are stored locally and persist between sessions.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
              },
            },
          },
          "README.txt": {
            type: "file",
            content:
              "GAMES DIRECTORY\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] Games Collection\n[2077-03-20] Classification: ENTERTAINMENT / TRAINING\n\nThis directory contains neural interface training programs\ndisguised as games. These applications help improve your\nconnection to the Wired through interactive challenges.\n\nAvailable Games:\n  - snake/       Neural interface training (Snake Game)\n                 Location: games/snake/snake.exe\n                 Improves reflexes and pattern recognition\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNOTES:\n- All games are terminal-based\n- High scores are tracked automatically\n- Some games have multiple difficulty modes\n- Training data is stored locally\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          },
        },
      },
      logs: {
        type: "dir",
        contents: {
          "system_access.log": {
            type: "file",
            content:
              "SYSTEM ACCESS LOG\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-15 14:20] Login: user@cyberpunk\n[2077-03-15 14:21] Command: help\n[2077-03-15 14:22] Command: ls\n[2077-03-15 14:23] File accessed: notes.txt\n[2077-03-16 09:40] Command: scan\n[2077-03-16 09:45] Command: hack 192.168.1.42\n[2077-03-17 22:10] Command: hack 192.168.1.100\n[2077-03-17 22:11] File accessed: network_map.txt\n\n[2077-03-18 12:00] Password Hint Found\nServer 192.168.1.42 uses default admin password\nFormat: ADMIN + 3 digits\n\n[2077-03-18 12:15] NeoCorp Vault Info\nServer 192.168.1.100 password pattern:\nCompany name (NEO) + CORP + year (2077)\nAll uppercase, no spaces",
          },
        },
      },
      "readme.txt": {
        type: "file",
        content:
          "WELCOME TO CYBERPUNK TERMINAL\n\nThis is a retro cyberpunk terminal interface\ninspired by 80s-90s computing aesthetics.\n\nEnjoy the nostalgia!",
      },
      "config.ini": {
        type: "file",
        content: "[SYSTEM]\nOS=CyberOS v2.0.2077\nKernel=4.20.69-cyber\nStatus=OPERATIONAL",
      },
      "log.dat": {
        type: "file",
        content:
          "2024-01-01 00:00:00 - System initialized\n2024-01-01 00:01:00 - Matrix mode enabled\n2024-01-01 00:02:00 - Terminal ready",
      },
    },
  },
  "/home/user/documents": {
    type: "dir",
    contents: {
      "notes.txt": {
        type: "file",
        content:
          "[2077-03-15 14:23] First Entry\nStarted investigating NeoCorp activities.\nSomething's wrong with their new 'Alpha' project.\n\n[2077-03-16 09:45] Anomaly Detected\nNetwork scan showed strange activity\non server 192.168.1.100. Need to investigate.\n\n[2077-03-17 22:10] Breakthrough!\nHacked into NeoCorp server. Found encrypted files.\nNeed to find a way to decrypt them.",
      },
    },
  },
  "/home/user/documents/notes.txt": {
    type: "file",
    content:
      "[2077-03-15 14:23] First Entry\nStarted investigating NeoCorp activities.\nSomething's wrong with their new 'Alpha' project.\n\n[2077-03-16 09:45] Anomaly Detected\nNetwork scan showed strange activity\non server 192.168.1.100. Need to investigate.\n\n[2077-03-17 22:10] Breakthrough!\nHacked into NeoCorp server. Found encrypted files.\nNeed to find a way to decrypt them.",
  },
  "/home/user/documents/contacts.txt": {
    type: "file",
    content:
      'HACKER CONTACTS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nLAIN\n  Handle: @lain_iwakura\n  Status: Connected to Wired\n  Specialty: Reality manipulation\n  Last seen: Present everywhere, Present nowhere\n  Note: "Present day, present time. HAHAHAHA."\n  WARNING: Do not attempt to understand. Present it.\n\nV\n  Handle: @v_nomad\n  Status: Active\n  Specialty: Netrunning & Solo operations\n  Last seen: 2077-12-10\n  Location: Night City\n  Note: Former streetkid, now legend. Has engram of Johnny Silverhand.\n\nJOHNNY\n  Handle: @silverhand_2077\n  Status: ENGRAM (Active in V\'s head)\n  Specialty: Rockerboy, revolutionary\n  Last seen: 2023 (original), 2077 (as engram)\n  Note: "Wake the fuck up, samurai. We have a city to burn."\n  WARNING: Unstable engram, may cause personality conflicts\n\nJUDY\n  Handle: @judy_alvarez\n  Status: Active\n  Specialty: Braindance editing, netrunning\n  Last seen: 2077-12-15\n  Location: Night City (Pacifica)\n  Note: Best BD editor in NC. Trustworthy, but watch for Mox connections.\n\nKILLY\n  Handle: @killy_seeker\n  Status: Wandering\n  Specialty: Gravitational Beam Emitter, survival\n  Last seen: Unknown (time dilation active)\n  Location: The City (possibly Earth, possibly future)\n  Note: Searching for Net Terminal Genes. Has been traveling for 3000+ years.\n  WARNING: Do not interfere with mission. Extremely dangerous.\n\nCIBO\n  Handle: @cibo_researcher\n  Status: UNKNOWN (last seen with Killy)\n  Specialty: Genetic research, Net Terminal access\n  Last seen: Unknown\n  Location: The City, deep levels\n  Note: Former Safeguard scientist. May have Net Terminal Genes.\n  WARNING: Status uncertain after last contact with Safeguard',
  },
  "/home/user/projects": {
    type: "dir",
    contents: {
      "virus_prototype.asm": {
        type: "file",
        content:
          "; VIRUS PROTOTYPE - DO NOT EXECUTE\n; Author: Unknown\n; Date: 2077-03-10\n\n; KILL SWITCH CODE: PROTOTYPE-KILL-SWITCH\n; If virus activates, use this code with antivirus command\n; Usage: antivirus PROTOTYPE-KILL-SWITCH\n\nsection .text\n    global _start\n\n_start:\n    ; Self-replication code\n    ; WARNING: This is experimental\n    ; Use at your own risk\n\n    mov eax, 1\n    int 0x80",
      },
      "killswitch.txt": {
        type: "file",
        content:
          "VIRUS PROTOTYPE KILL SWITCH\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-10] Prototype Documentation\n[2077-03-10] Author: Unknown\n[2077-03-10] Classification: EXPERIMENTAL\n\nThis file contains the kill switch code for the\nvirus prototype. If the prototype activates and\ngoes out of control, use this code to deactivate it.\n\nKILL SWITCH CODE:\nPROTOTYPE-KILL-SWITCH\n\nUsage: antivirus PROTOTYPE-KILL-SWITCH\n\nWARNING: This code only works for prototype-type viruses.\nFor other virus types, different codes are required.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nVIRUS TYPE: Prototype\nKILL SWITCH: PROTOTYPE-KILL-SWITCH\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      },
      "exploit_framework.c": {
        type: "file",
        content:
          '/* EXPLOIT FRAMEWORK v2.0 */\n/* Framework for testing vulnerabilities */\n\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Buffer overflow test\n    char buffer[64];\n    printf("Testing buffer overflow...\\n");\n    \n    // SQL injection test\n    printf("Testing SQL injection...\\n");\n    \n    return 0;\n}',
      },
    },
  },
  "/home/user/projects/virus_prototype.asm": {
    type: "file",
    content:
      "; VIRUS PROTOTYPE - DO NOT EXECUTE\n; Author: Unknown\n; Date: 2077-03-10\n\n; KILL SWITCH CODE: PROTOTYPE-KILL-SWITCH\n; If virus activates, use this code with antivirus command\n; Usage: antivirus PROTOTYPE-KILL-SWITCH\n\nsection .text\n    global _start\n\n_start:\n    ; Self-replication code\n    ; WARNING: This is experimental\n    ; Use at your own risk\n\n    mov eax, 1\n    int 0x80",
  },
  "/home/user/projects/killswitch.txt": {
    type: "file",
    content:
      "VIRUS PROTOTYPE KILL SWITCH\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-10] Prototype Documentation\n[2077-03-10] Author: Unknown\n[2077-03-10] Classification: EXPERIMENTAL\n\nThis file contains the kill switch code for the\nvirus prototype. If the prototype activates and\ngoes out of control, use this code to deactivate it.\n\nKILL SWITCH CODE:\nPROTOTYPE-KILL-SWITCH\n\nUsage: antivirus PROTOTYPE-KILL-SWITCH\n\nWARNING: This code only works for prototype-type viruses.\nFor other virus types, different codes are required.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nVIRUS TYPE: Prototype\nKILL SWITCH: PROTOTYPE-KILL-SWITCH\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  },
  "/home/user/projects/exploit_framework.c": {
    type: "file",
    content:
      '/* EXPLOIT FRAMEWORK v2.0 */\n/* Framework for testing vulnerabilities */\n\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Buffer overflow test\n    char buffer[64];\n    printf("Testing buffer overflow...\\n");\n    \n    // SQL injection test\n    printf("Testing SQL injection...\\n");\n    \n    return 0;\n}',
  },
  "/home/user/secrets": {
    type: "dir",
    contents: {},
  },
  "/home/user/music": {
    type: "dir",
    contents: {
      "metadata.json": {
        type: "file",
        content:
          '{\n  "tracks": [\n    {\n      "filename": "mothra.wav",\n      "title": "mothra.wav",\n      "artist": "happyalready",\n      "duration": 56,\n      "format": "wav"\n    },\n    {\n      "filename": "shadowprotocol-darkambientdrone-morbid-mix.ogg",\n      "title": "shadowprotocol-darkambientdrone-morbid-mix.ogg",\n      "artist": "glitchart",\n      "duration": 128,\n      "format": "ogg"\n    }\n  ]\n}',
      },
      "mothra.wav": {
        type: "file",
        content:
          "[BINARY AUDIO FILE]\n\nFile: mothra.wav\nFormat: WAV\nArtist: happyalready\nDuration: 56 seconds\n\nThis is a binary audio file.\nUse the music player to play it.\n\nTo play: music open, then 'play mothra.wav'",
      },
      "shadowprotocol-darkambientdrone-morbid-mix.ogg": {
        type: "file",
        content:
          "[BINARY AUDIO FILE]\n\nFile: shadowprotocol-darkambientdrone-morbid-mix.ogg\nFormat: OGG\nArtist: glitchart\nDuration: 128 seconds\n\nThis is a binary audio file.\nUse the music player to play it.\n\nTo play: music open, then 'play shadowprotocol-darkambientdrone-morbid-mix.ogg'",
      },
      "player.exe": {
        type: "file",
        content:
          "MUSIC PLAYER APPLICATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] Music Player v1.0\n[2077-03-20] Author: Cyberpunk Terminal Team\n[2077-03-20] Classification: MEDIA PLAYER\n\nThis is the music player executable.\n\nTo run:\n  open player.exe\n  or\n  ./music/player.exe\n\nFeatures:\n  - 8-bit music playback\n  - ASCII visualization\n  - Terminal-based interface\n  - Support for OGG and WAV formats\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      },
    },
  },
  "/home/user/music/metadata.json": {
    type: "file",
    content:
      '{\n  "tracks": [\n    {\n      "filename": "mothra.wav",\n      "title": "mothra.wav",\n      "artist": "happyalready",\n      "duration": 56,\n      "format": "wav"\n    },\n    {\n      "filename": "shadowprotocol-darkambientdrone-morbid-mix.ogg",\n      "title": "shadowprotocol-darkambientdrone-morbid-mix.ogg",\n      "artist": "glitchart",\n      "duration": 128,\n      "format": "ogg"\n    }\n  ]\n}',
  },
  "/home/user/music/mothra.wav": {
    type: "file",
    content:
      "[BINARY AUDIO FILE]\n\nFile: mothra.wav\nFormat: WAV\nArtist: happyalready\nDuration: 56 seconds\n\nThis is a binary audio file.\nUse the music player to play it.\n\nTo play: music open, then 'play mothra.wav'",
  },
  "/home/user/music/shadowprotocol-darkambientdrone-morbid-mix.ogg": {
    type: "file",
    content:
      "[BINARY AUDIO FILE]\n\nFile: shadowprotocol-darkambientdrone-morbid-mix.ogg\nFormat: OGG\nArtist: glitchart\nDuration: 128 seconds\n\nThis is a binary audio file.\nUse the music player to play it.\n\nTo play: music open, then 'play shadowprotocol-darkambientdrone-morbid-mix.ogg'",
  },
  "/home/user/music/player.exe": {
    type: "file",
    content:
      "MUSIC PLAYER APPLICATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] Music Player v1.0\n[2077-03-20] Author: Cyberpunk Terminal Team\n[2077-03-20] Classification: MEDIA PLAYER\n\nThis is the music player executable.\n\nTo run:\n  open player.exe\n  or\n  ./music/player.exe\n\nFeatures:\n  - 8-bit music playback\n  - ASCII visualization\n  - Terminal-based interface\n  - Support for OGG and WAV formats\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  },
  "/home/user/mail": {
    type: "dir",
    contents: {
      "mail.exe": {
        type: "file",
        content:
          "EMAIL CLIENT APPLICATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] Email Client v1.0\n[2077-03-20] Author: Cyberpunk Terminal Team\n[2077-03-20] Classification: COMMUNICATION INTERFACE\n\nThis is the Email Client executable.\nA secure terminal-based email client for Wired communications.\n\nTo run:\n  open mail.exe\n  or\n  ./mail/mail.exe\n  or\n  mail\n\nFeatures:\n  - Secure encrypted messaging\n  - Terminal-based interface\n  - Wired network integration\n  - Message filtering and search\n  - Contact management\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNETWORK STATUS: CONNECTED\nENCRYPTION: E2EE (End-to-End Encrypted)\nPROTOCOL: Wired Mail Protocol v2.0\n\nAll messages are encrypted using military-grade algorithms.\nYour communications are secure, but remember:\nin the Wired, nothing is truly private.\n\nSome messages may contain hidden data or viruses.\nAlways scan attachments before opening.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nKNOWN ISSUES:\n- Messages from @lain_iwakura may cause reality glitches\n- Time-stamped messages from the future are not supported\n- Neural interface interference may corrupt message headers\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      },
    },
  },
  "/home/user/mail/mail.exe": {
    type: "file",
    content:
      "EMAIL CLIENT APPLICATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] Email Client v1.0\n[2077-03-20] Author: Cyberpunk Terminal Team\n[2077-03-20] Classification: COMMUNICATION INTERFACE\n\nThis is the Email Client executable.\nA secure terminal-based email client for Wired communications.\n\nTo run:\n  open mail.exe\n  or\n  ./mail/mail.exe\n  or\n  mail\n\nFeatures:\n  - Secure encrypted messaging\n  - Terminal-based interface\n  - Wired network integration\n  - Message filtering and search\n  - Contact management\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNETWORK STATUS: CONNECTED\nENCRYPTION: E2EE (End-to-End Encrypted)\nPROTOCOL: Wired Mail Protocol v2.0\n\nAll messages are encrypted using military-grade algorithms.\nYour communications are secure, but remember:\nin the Wired, nothing is truly private.\n\nSome messages may contain hidden data or viruses.\nAlways scan attachments before opening.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nKNOWN ISSUES:\n- Messages from @lain_iwakura may cause reality glitches\n- Time-stamped messages from the future are not supported\n- Neural interface interference may corrupt message headers\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  },
  "/home/user/games": {
    type: "dir",
    contents: {
      snake: {
        type: "dir",
        contents: {
          "snake.exe": {
            type: "file",
            content:
              "SNAKE GAME APPLICATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] Snake Game v1.0\n[2077-03-20] Author: Cyberpunk Terminal Team\n[2077-03-20] Classification: NEURAL INTERFACE TRAINING\n\nThis is the Snake Game executable.\nA neural interface training program disguised as a game.\n\nTo run:\n  open snake.exe\n  or\n  ./games/snake/snake.exe\n  or\n  snake\n\nFeatures:\n  - ASCII-based visualization\n  - Adaptive difficulty system\n  - Obstacle mode for advanced training\n  - High score tracking\n  - Terminal-based interface\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNEURAL INTERFACE STATUS: ACTIVE\nTRAINING MODE: ENABLED\n\nEach point you score strengthens your connection\nto the Wired. Each level brings you closer to...\n\nBut remember: in the real world, there are no restarts.\nEvery mistake has consequences.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          },
          "highscores.dat": {
            type: "file",
            content:
              'GAME HIGH SCORES DATABASE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] High Scores Log\n[2077-03-20] Format: Binary (JSON encoded)\n[2077-03-20] Classification: NEURAL INTERFACE DATA\n\nThis file contains encrypted high score data for all games.\nScores are automatically updated when you achieve new records.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nENCRYPTION: AES-256\nSTATUS: ACTIVE\nLOCATION: LocalStorage (browser)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[DECRYPTED RECORDS - SNAKE GAME]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1.  @lain_iwakura          - 999 points (Level 99, hard, obstacles)\n   Date: 2077-03-15 23:59:59\n   Note: "Present day, present time. HAHAHAHA."\n   Status: Connected to Wired\n\n2.  @killy_seeker           - 847 points (Level 84, hard, obstacles)\n   Date: 2077-03-10 12:30:15\n   Note: "Net Terminal Genes activated. Pattern recognition: optimal."\n   Status: Wandering (time dilation active)\n\n3.  @v_nomad                - 623 points (Level 62, medium, obstacles)\n   Date: 2077-12-10 18:45:22\n   Note: "Johnny says I\'m getting better. Still not as good as him."\n   Status: Active in Night City\n\n4.  @silverhand_2077        - 512 points (Level 51, medium, classic)\n   Date: 2023-11-16 20:20:20\n   Note: "Wake the fuck up, samurai. We have a city to burn."\n   Status: ENGRAM (Active in V\'s head)\n\n5.  @judy_alvarez           - 456 points (Level 45, medium, obstacles)\n   Date: 2077-12-15 14:20:10\n   Note: "BD editing skills translate well to pattern recognition."\n   Status: Active in Pacifica\n\n6.  @cibo_researcher        - 389 points (Level 38, medium, obstacles)\n   Date: Unknown (time dilation active)\n   Note: "Genetic research patterns help with neural interface training."\n   Status: UNKNOWN (last seen with Killy)\n\n7.  user@cyberpunk          - 247 points (Level 24, easy, classic)\n   Date: 2077-03-18 03:33:33\n   Note: "Strange... I don\'t remember playing this game."\n   Status: ??? ACTIVE ???\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nANOMALY DETECTED\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nEntry #7 (user@cyberpunk) shows activity from 2077-03-18,\nbut system logs indicate no game sessions on that date.\n\nPossible explanations:\n- Data corruption\n- Time synchronization error\n- Unauthorized access\n- Neural interface interference\n\nInvestigation required.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nENCRYPTION KEY HINT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nThe highest score belongs to @lain_iwakura.\nHer message contains a pattern: "Present day, present time."\n\nIf you can decode this pattern, you might find something...\nBut remember: in the Wired, nothing is as it seems.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTo view your current scores:\n  - In Snake Game: type \'scores\' command\n  - Or check game-specific commands\n\nNote: Scores are stored locally and persist between sessions.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          },
        },
      },
      "README.txt": {
        type: "file",
        content:
          "GAMES DIRECTORY\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] Games Collection\n[2077-03-20] Classification: ENTERTAINMENT / TRAINING\n\nThis directory contains neural interface training programs\ndisguised as games. These applications help improve your\nconnection to the Wired through interactive challenges.\n\nAvailable Games:\n  - snake/       Neural interface training (Snake Game)\n                 Location: games/snake/snake.exe\n                 Improves reflexes and pattern recognition\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNOTES:\n- All games are terminal-based\n- High scores are tracked automatically\n- Some games have multiple difficulty modes\n- Training data is stored locally\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      },
    },
  },
  "/home/user/games/snake": {
    type: "dir",
    contents: {
      "snake.exe": {
        type: "file",
        content:
          "SNAKE GAME APPLICATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] Snake Game v1.0\n[2077-03-20] Author: Cyberpunk Terminal Team\n[2077-03-20] Classification: NEURAL INTERFACE TRAINING\n\nThis is the Snake Game executable.\nA neural interface training program disguised as a game.\n\nTo run:\n  open snake.exe\n  or\n  ./games/snake/snake.exe\n  or\n  snake\n\nFeatures:\n  - ASCII-based visualization\n  - Adaptive difficulty system\n  - Obstacle mode for advanced training\n  - High score tracking\n  - Terminal-based interface\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNEURAL INTERFACE STATUS: ACTIVE\nTRAINING MODE: ENABLED\n\nEach point you score strengthens your connection\nto the Wired. Each level brings you closer to...\n\nBut remember: in the real world, there are no restarts.\nEvery mistake has consequences.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      },
      "highscores.dat": {
        type: "file",
        content:
          'GAME HIGH SCORES DATABASE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] High Scores Log\n[2077-03-20] Format: Binary (JSON encoded)\n[2077-03-20] Classification: NEURAL INTERFACE DATA\n\nThis file contains encrypted high score data for all games.\nScores are automatically updated when you achieve new records.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nENCRYPTION: AES-256\nSTATUS: ACTIVE\nLOCATION: LocalStorage (browser)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[DECRYPTED RECORDS - SNAKE GAME]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1.  @lain_iwakura          - 999 points (Level 99, hard, obstacles)\n   Date: 2077-03-15 23:59:59\n   Note: "Present day, present time. HAHAHAHA."\n   Status: Connected to Wired\n\n2.  @killy_seeker           - 847 points (Level 84, hard, obstacles)\n   Date: 2077-03-10 12:30:15\n   Note: "Net Terminal Genes activated. Pattern recognition: optimal."\n   Status: Wandering (time dilation active)\n\n3.  @v_nomad                - 623 points (Level 62, medium, obstacles)\n   Date: 2077-12-10 18:45:22\n   Note: "Johnny says I\'m getting better. Still not as good as him."\n   Status: Active in Night City\n\n4.  @silverhand_2077        - 512 points (Level 51, medium, classic)\n   Date: 2023-11-16 20:20:20\n   Note: "Wake the fuck up, samurai. We have a city to burn."\n   Status: ENGRAM (Active in V\'s head)\n\n5.  @judy_alvarez           - 456 points (Level 45, medium, obstacles)\n   Date: 2077-12-15 14:20:10\n   Note: "BD editing skills translate well to pattern recognition."\n   Status: Active in Pacifica\n\n6.  @cibo_researcher        - 389 points (Level 38, medium, obstacles)\n   Date: Unknown (time dilation active)\n   Note: "Genetic research patterns help with neural interface training."\n   Status: UNKNOWN (last seen with Killy)\n\n7.  user@cyberpunk          - 247 points (Level 24, easy, classic)\n   Date: 2077-03-18 03:33:33\n   Note: "Strange... I don\'t remember playing this game."\n   Status: ??? ACTIVE ???\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nANOMALY DETECTED\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nEntry #7 (user@cyberpunk) shows activity from 2077-03-18,\nbut system logs indicate no game sessions on that date.\n\nPossible explanations:\n- Data corruption\n- Time synchronization error\n- Unauthorized access\n- Neural interface interference\n\nInvestigation required.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nENCRYPTION KEY HINT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nThe highest score belongs to @lain_iwakura.\nHer message contains a pattern: "Present day, present time."\n\nIf you can decode this pattern, you might find something...\nBut remember: in the Wired, nothing is as it seems.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTo view your current scores:\n  - In Snake Game: type \'scores\' command\n  - Or check game-specific commands\n\nNote: Scores are stored locally and persist between sessions.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      },
    },
  },
  "/home/user/games/snake/snake.exe": {
    type: "file",
    content:
      "SNAKE GAME APPLICATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] Snake Game v1.0\n[2077-03-20] Author: Cyberpunk Terminal Team\n[2077-03-20] Classification: NEURAL INTERFACE TRAINING\n\nThis is the Snake Game executable.\nA neural interface training program disguised as a game.\n\nTo run:\n  open snake.exe\n  or\n  ./games/snake/snake.exe\n  or\n  snake\n\nFeatures:\n  - ASCII-based visualization\n  - Adaptive difficulty system\n  - Obstacle mode for advanced training\n  - High score tracking\n  - Terminal-based interface\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNEURAL INTERFACE STATUS: ACTIVE\nTRAINING MODE: ENABLED\n\nEach point you score strengthens your connection\nto the Wired. Each level brings you closer to...\n\nBut remember: in the real world, there are no restarts.\nEvery mistake has consequences.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  },
  "/home/user/games/snake/highscores.dat": {
    type: "file",
    content:
      'GAME HIGH SCORES DATABASE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] High Scores Log\n[2077-03-20] Format: Binary (JSON encoded)\n[2077-03-20] Classification: NEURAL INTERFACE DATA\n\nThis file contains encrypted high score data for all games.\nScores are automatically updated when you achieve new records.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nENCRYPTION: AES-256\nSTATUS: ACTIVE\nLOCATION: LocalStorage (browser)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[DECRYPTED RECORDS - SNAKE GAME]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1.  @lain_iwakura          - 999 points (Level 99, hard, obstacles)\n   Date: 2077-03-15 23:59:59\n   Note: "Present day, present time. HAHAHAHA."\n   Status: Connected to Wired\n\n2.  @killy_seeker           - 847 points (Level 84, hard, obstacles)\n   Date: 2077-03-10 12:30:15\n   Note: "Net Terminal Genes activated. Pattern recognition: optimal."\n   Status: Wandering (time dilation active)\n\n3.  @v_nomad                - 623 points (Level 62, medium, obstacles)\n   Date: 2077-12-10 18:45:22\n   Note: "Johnny says I\'m getting better. Still not as good as him."\n   Status: Active in Night City\n\n4.  @silverhand_2077        - 512 points (Level 51, medium, classic)\n   Date: 2023-11-16 20:20:20\n   Note: "Wake the fuck up, samurai. We have a city to burn."\n   Status: ENGRAM (Active in V\'s head)\n\n5.  @judy_alvarez           - 456 points (Level 45, medium, obstacles)\n   Date: 2077-12-15 14:20:10\n   Note: "BD editing skills translate well to pattern recognition."\n   Status: Active in Pacifica\n\n6.  @cibo_researcher        - 389 points (Level 38, medium, obstacles)\n   Date: Unknown (time dilation active)\n   Note: "Genetic research patterns help with neural interface training."\n   Status: UNKNOWN (last seen with Killy)\n\n7.  user@cyberpunk          - 247 points (Level 24, easy, classic)\n   Date: 2077-03-18 03:33:33\n   Note: "Strange... I don\'t remember playing this game."\n   Status: ??? ACTIVE ???\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nANOMALY DETECTED\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nEntry #7 (user@cyberpunk) shows activity from 2077-03-18,\nbut system logs indicate no game sessions on that date.\n\nPossible explanations:\n- Data corruption\n- Time synchronization error\n- Unauthorized access\n- Neural interface interference\n\nInvestigation required.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nENCRYPTION KEY HINT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nThe highest score belongs to @lain_iwakura.\nHer message contains a pattern: "Present day, present time."\n\nIf you can decode this pattern, you might find something...\nBut remember: in the Wired, nothing is as it seems.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTo view your current scores:\n  - In Snake Game: type \'scores\' command\n  - Or check game-specific commands\n\nNote: Scores are stored locally and persist between sessions.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  },
  "/home/user/games/README.txt": {
    type: "file",
    content:
      "GAMES DIRECTORY\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-20] Games Collection\n[2077-03-20] Classification: ENTERTAINMENT / TRAINING\n\nThis directory contains neural interface training programs\ndisguised as games. These applications help improve your\nconnection to the Wired through interactive challenges.\n\nAvailable Games:\n  - snake/       Neural interface training (Snake Game)\n                 Location: games/snake/snake.exe\n                 Improves reflexes and pattern recognition\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNOTES:\n- All games are terminal-based\n- High scores are tracked automatically\n- Some games have multiple difficulty modes\n- Training data is stored locally\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  },
  "/home/user/logs": {
    type: "dir",
    contents: {
      "system_access.log": {
        type: "file",
        content:
          "SYSTEM ACCESS LOG\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-15 14:20] Login: user@cyberpunk\n[2077-03-15 14:21] Command: help\n[2077-03-15 14:22] Command: ls\n[2077-03-15 14:23] File accessed: notes.txt\n[2077-03-16 09:40] Command: scan\n[2077-03-16 09:45] Command: hack 192.168.1.42\n[2077-03-17 22:10] Command: hack 192.168.1.100\n[2077-03-17 22:11] File accessed: network_map.txt",
      },
    },
  },
  "/home/user/logs/system_access.log": {
    type: "file",
    content:
      "SYSTEM ACCESS LOG\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-15 14:20] Login: user@cyberpunk\n[2077-03-15 14:21] Command: help\n[2077-03-15 14:22] Command: ls\n[2077-03-15 14:23] File accessed: notes.txt\n[2077-03-16 09:40] Command: scan\n[2077-03-16 09:45] Command: hack 192.168.1.42\n[2077-03-17 22:10] Command: hack 192.168.1.100\n[2077-03-17 22:11] File accessed: network_map.txt",
  },
  "/home/user/readme.txt": {
    type: "file",
    content:
      "WELCOME TO CYBERPUNK TERMINAL\n\nThis is a retro cyberpunk terminal interface\ninspired by 80s-90s computing aesthetics.\n\nEnjoy the nostalgia!",
  },
  "/home/user/config.ini": {
    type: "file",
    content: "[SYSTEM]\nOS=CyberOS v2.0.2077\nKernel=4.20.69-cyber\nStatus=OPERATIONAL",
  },
  "/home/user/log.dat": {
    type: "file",
    content:
      "2024-01-01 00:00:00 - System initialized\n2024-01-01 00:01:00 - Matrix mode enabled\n2024-01-01 00:02:00 - Terminal ready",
  },
};

const migrateFileSystem = (fs: Record<string, FileSystemNode>): Record<string, FileSystemNode> => {
  const migrated = { ...fs };

  const systemFilesToUpdate = ["/home/user/documents/contacts.txt"];

  for (const [path, node] of Object.entries(defaultFileSystem)) {
    if (!migrated[path]) {
      migrated[path] = JSON.parse(JSON.stringify(node));
    } else if (node.type === "dir" && migrated[path].type === "dir") {
      if (!migrated[path].contents) {
        migrated[path].contents = {};
      }
      if (node.contents) {
        for (const [name, child] of Object.entries(node.contents)) {
          const fullPath = path === "/" ? `/${name}` : `${path}/${name}`;

          if (systemFilesToUpdate.includes(fullPath) && node.contents[name].type === "file") {
            migrated[path].contents![name] = JSON.parse(JSON.stringify(child));
            if (migrated[fullPath]) {
              migrated[fullPath] = JSON.parse(JSON.stringify(child));
            }
          } else if (!migrated[path].contents![name]) {
            migrated[path].contents![name] = JSON.parse(JSON.stringify(child));
          }
        }
      }
    } else if (node.type === "file" && systemFilesToUpdate.includes(path)) {
      migrated[path] = JSON.parse(JSON.stringify(node));
    }
  }

  const lainMessagePath = "/home/user/secrets/message_from_lain.dat";
  const lainCodePath = "/home/user/secrets/lain_disconnect_code.txt";

  if (migrated[lainMessagePath] && !migrated[lainCodePath]) {
    const secretsDir = "/home/user/secrets";
    if (
      migrated[secretsDir] &&
      migrated[secretsDir].type === "dir" &&
      migrated[secretsDir].contents
    ) {
      const deactivationCodeContent = `LAIN DISCONNECT CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 14:45] Found in Wired message metadata
[2077-03-20 14:45] Source: lain@wired.2077
[2077-03-20 14:45] Classification: INTERNAL USE ONLY

This file contains the disconnect code for adware
viruses sent through Wired messages.

If you have activated an adware virus from Lain's
message, use this code to deactivate it:

LAIN-DISCONNECT-2077

Usage: antivirus LAIN-DISCONNECT-2077

Note: This code only works for adware-type viruses.
For other virus types, different codes are required.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIRUS TYPE: Adware
DISCONNECT CODE: LAIN-DISCONNECT-2077
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      migrated[secretsDir].contents!["lain_disconnect_code.txt"] = {
        type: "file",
        content: deactivationCodeContent,
      };
      migrated[lainCodePath] = {
        type: "file",
        content: deactivationCodeContent,
      };

      const corruptedUnicodePath = `${secretsDir}/corrupted_unicode.dat`;
      const unicodeFixCodePath = `${secretsDir}/unicode_fix_code.txt`;
      if (migrated[corruptedUnicodePath] && !migrated[unicodeFixCodePath]) {
        const unicodeFixCodeContent = `UNICODE FIX CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 15:00] Found in system encoding logs
[2077-03-20 15:00] Source: System encoding repair tool
[2077-03-20 15:00] Classification: INTERNAL USE ONLY

This file contains the fix code for corruption
viruses that corrupt Unicode text encoding.

If you have activated a corruption virus, use this code
to deactivate it and restore text encoding:

UNICODE-FIX-UTF8

Usage: antivirus UNICODE-FIX-UTF8

Note: This code only works for corruption-type viruses.
For other virus types, different codes are required.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIRUS TYPE: Corruption
FIX CODE: UNICODE-FIX-UTF8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        migrated[secretsDir].contents!["unicode_fix_code.txt"] = {
          type: "file",
          content: unicodeFixCodeContent,
        };
        migrated[unicodeFixCodePath] = {
          type: "file",
          content: unicodeFixCodeContent,
        };
      }
    }
  }

  return migrated;
};

const loadFileSystem = (): Record<string, FileSystemNode> => {
  const saved = storageManager.get<Record<string, FileSystemNode>>(FILESYSTEM_STORAGE_KEY);
  if (saved) {
    const migrated = migrateFileSystem(saved);
    storageManager.set(FILESYSTEM_STORAGE_KEY, migrated);
    return migrated;
  }
  return JSON.parse(JSON.stringify(defaultFileSystem));
};

export const saveFileSystem = (fs: Record<string, FileSystemNode>): void => {
  storageManager.set(FILESYSTEM_STORAGE_KEY, fs);
  fileSystem = fs;
};

let fileSystem = loadFileSystem();

const savedDir = storageManager.get<string>(CURRENT_DIR_STORAGE_KEY);
if (savedDir && fileSystem[savedDir]) {
  currentDirectory = savedDir;
}

export const getCurrentDirectory = (): string => currentDirectory;

export const setCurrentDirectory = (path: string): void => {
  currentDirectory = path;
  storageManager.set(CURRENT_DIR_STORAGE_KEY, currentDirectory);
};

export const getFileSystem = (): Record<string, FileSystemNode> => {
  return loadFileSystem();
};

export const getCurrentDirContents = (): FileSystemNode | undefined => {
  const fs = getFileSystem();
  return fs[currentDirectory];
};

export const createDirectory = (name: string): boolean => {
  fileSystem = getFileSystem();
  const newPath = currentDirectory + "/" + name;
  if (fileSystem[newPath]) {
    return false;
  }
  const parent = fileSystem[currentDirectory];
  if (parent && parent.contents) {
    parent.contents[name] = { type: "dir", contents: {} };
    fileSystem[newPath] = { type: "dir", contents: {} };
    saveFileSystem(fileSystem);
    return true;
  }
  return false;
};

export const createFile = (name: string, content: string = ""): boolean => {
  fileSystem = getFileSystem();
  const parent = fileSystem[currentDirectory];
  if (parent && parent.contents) {
    if (parent.contents[name]) {
      return false; // Файл уже существует
    }
    parent.contents[name] = { type: "file", content };
    const filePath = currentDirectory + "/" + name;
    fileSystem[filePath] = { type: "file", content };
    saveFileSystem(fileSystem);
    return true;
  }
  return false;
};

export const writeFile = (name: string, content: string): boolean => {
  fileSystem = getFileSystem();
  const parent = fileSystem[currentDirectory];
  if (parent && parent.contents && parent.contents[name]) {
    const file = parent.contents[name];
    if (file.type === "file") {
      file.content = content;
      const filePath = currentDirectory + "/" + name;
      if (fileSystem[filePath]) {
        fileSystem[filePath].content = content;
      }
      saveFileSystem(fileSystem);
      return true;
    }
  }
  return false;
};

export const deleteNode = (name: string): boolean => {
  fileSystem = getFileSystem();
  const targetPath = currentDirectory + "/" + name;
  const parent = fileSystem[currentDirectory];
  if (parent && parent.contents && parent.contents[name]) {
    const node = parent.contents[name];
    if (node.type === "dir" && node.contents) {
      const deleteRecursive = (path: string) => {
        const node = fileSystem[path];
        if (node && node.type === "dir" && node.contents) {
          Object.keys(node.contents).forEach(childName => {
            deleteRecursive(path + "/" + childName);
          });
        }
        delete fileSystem[path];
      };
      deleteRecursive(targetPath);
    }
    delete parent.contents[name];
    delete fileSystem[targetPath];
    saveFileSystem(fileSystem);
    return true;
  }
  return false;
};

export const changeDirectory = (target: string): { success: boolean; path: string } => {
  fileSystem = getFileSystem();

  const resolvedPath = resolveRelativePath(target, currentDirectory);

  if (fileSystem[resolvedPath] && fileSystem[resolvedPath].type === "dir") {
    currentDirectory = resolvedPath;
    setCurrentDirectory(currentDirectory);
    return { success: true, path: currentDirectory };
  }

  return { success: false, path: currentDirectory };
};
