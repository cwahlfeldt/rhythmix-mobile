export interface SongMetadata {
    name: string;
    encoded_song: string;
    song_url?: string;  // Optional URL for direct audio loading
    bpm: number;
    difficulty: number;
    duration: number;
    recommended_scroll_speed: number;
}

export interface Note {
    intensity: number;
    lane: number;
    timestamp: number;
    type: string;
    position?: { value: number };  // SharedValue for current Y position
}

export interface Section {
    start_time: number;
    end_time: number;
    intensity: number;
    section_type: string;
}

export interface SongData {
    metadata: SongMetadata;
    notes: Note[];
    sections: Section[];
}

export interface SongResponse {
    success: boolean;
    data: SongData;
}