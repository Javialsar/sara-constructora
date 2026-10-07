export interface Talent {
    id: string;
    name: string;
    profession: string;
    yearsOfExperience: number;
    isAvailable: boolean;
}

export interface JobApplication {
    id: string;
    talentId: string;
    jobId: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    applicationDate: Date;
}

// Mock database for talent
const talentDB: Talent[] = [
    { id: '1', name: 'Juan Perez', profession: 'Maestro de Obra', yearsOfExperience: 10, isAvailable: true },
    { id: '2', name: 'Ana Gomez', profession: 'Arquitecta', yearsOfExperience: 5, isAvailable: true },
    { id: '3', name: 'Carlos Ruiz', profession: 'Maestro de Obra', yearsOfExperience: 2, isAvailable: false },
    { id: '4', name: 'Maria Torres', profession: 'Arquitecta', yearsOfExperience: 8, isAvailable: true }
];

const applicationsDB: JobApplication[] = [];

export class SaraTalentoService {
    /**
     * Search for talent based on profession, minimum experience, and availability.
     */
    public searchTalent(profession: string, minExperience: number, requireAvailable: boolean = true): Talent[] {
        return talentDB.filter(talent => {
            const matchProfession = talent.profession.toLowerCase() === profession.toLowerCase();
            const matchExperience = talent.yearsOfExperience >= minExperience;
            const matchAvailability = requireAvailable ? talent.isAvailable : true;
            
            return matchProfession && matchExperience && matchAvailability;
        });
    }

    /**
     * Create a new job application (postulación) for a talent.
     */
    public createApplication(talentId: string, jobId: string): JobApplication {
        const talent = talentDB.find(t => t.id === talentId);
        if (!talent) {
            throw new Error('Talent not found');
        }

        const newApplication: JobApplication = {
            id: Math.random().toString(36).substr(2, 9),
            talentId,
            jobId,
            status: 'PENDING',
            applicationDate: new Date()
        };

        applicationsDB.push(newApplication);
        return newApplication;
    }
    
    /**
     * Get all applications (utility method)
     */
    public getAllApplications(): JobApplication[] {
        return applicationsDB;
    }
}
