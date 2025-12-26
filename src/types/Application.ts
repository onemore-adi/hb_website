// Application type definition for join us submissions

export interface Application {
    id: string;                    // Document ID (typically rollNo)
    rollNo: string;                // Primary identifier (unique)
    email: string;                 // Secondary identifier
    name: string;
    phone?: string;
    field: string;                 // Primary instrument / role
    otherField?: string;
    department?: string;
    year?: string;
    experience?: string;           // Prior band experience
    commitment?: string;           // Commitment level
    musicalStyles?: string;        // Musical styles proficient in
    yearsExperience?: string;
    metronomeUsage?: string;
    musicalInfluences?: string;    // Top 3 influences
    videoLink?: string;            // Audition video
    performanceLink?: string;      // Legacy field
    message?: string;              // Legacy field
    status: 'pending' | 'accepted' | 'declined';
    source: 'google_forms' | 'website';
    linkedUserId?: string;         // Set when user creates account
    submittedAt: { seconds: number; nanoseconds: number } | Date;
    updatedAt: { seconds: number; nanoseconds: number } | Date;
}
