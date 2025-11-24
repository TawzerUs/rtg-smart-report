export const getDemoState = () => {
    const today = new Date().toISOString().split('T')[0];
    const rtgs = [];
    const workOrders = [];
    const paintingData = [];
    const corrosionData = [];

    // Specific RTG IDs from PRD
    const rtgIds = ['RTG12', 'RTG13', 'RTG15', 'RTG16', 'RTG18', 'RTG19', 'RTG21'];

    rtgIds.forEach((rtgId, index) => {
        // 1. RTG Entity
        // Varied status for realism
        let rtgStatus = 'Pending';
        if (index === 0) rtgStatus = 'In Progress'; // RTG12
        if (index === 1) rtgStatus = 'Completed';   // RTG13
        if (index === 2) rtgStatus = 'In Progress'; // RTG15

        rtgs.push({
            id: rtgId,
            name: rtgId,
            status: rtgStatus,
            location: 'Terminal 1',
            lastUpdate: today,
            capacity: '50/61T',
            brand: 'KALMAR',
            code: `SPIDER-${rtgId}`
        });

        // 2. Work Orders (PRD Modules)
        // Lavage, Inspection, Sablage, Peinture
        const tasks = [
            { title: 'Lavage Industriel', priority: 'High', status: 'Pending' },
            { title: 'Inspection Corrosion', priority: 'High', status: 'Pending' },
            { title: 'Sablage SA 2.5', priority: 'High', status: 'Pending' },
            { title: 'Système Peinture PPG', priority: 'Normal', status: 'Pending' }
        ];

        tasks.forEach((task, taskIndex) => {
            // Simulate some progress based on RTG status
            let status = 'Pending';

            if (index === 0) { // RTG12: Active
                if (taskIndex === 0) status = 'Completed'; // Lavage done
                if (taskIndex === 1) status = 'In Progress'; // Inspection in progress
            } else if (index === 1) { // RTG13: Completed
                status = 'Completed';
            } else if (index === 2) { // RTG15: Active
                if (taskIndex <= 2) status = 'Completed';
                if (taskIndex === 3) status = 'In Progress';
            }

            workOrders.push({
                id: Date.now() + index * 100 + taskIndex,
                rtgId,
                title: task.title,
                status,
                priority: task.priority,
                deadline: today,
                assignedTo: 2 // Technician
            });
        });

        // 3. Painting Data (PPG Specs)
        paintingData.push(
            {
                id: index * 10 + 1,
                rtgId,
                type: 'exterior',
                layers: [
                    { id: 1, name: 'Primaire: PPG SigmaCover', target: 70, unit: 'µm', status: index === 1 ? 'Completed' : 'Pending', actual: index === 1 ? 72 : null, humidity: null },
                    { id: 2, name: 'Intermédiaire: PPG SigmaGuard', target: 150, unit: 'µm', status: index === 1 ? 'Completed' : 'Pending', actual: index === 1 ? 155 : null, humidity: null },
                    { id: 3, name: 'Finale: PPG SigmaDur', target: 60, unit: 'µm', status: index === 1 ? 'Completed' : 'Pending', actual: index === 1 ? 62 : null, humidity: null },
                ]
            },
            {
                id: index * 10 + 2,
                rtgId,
                type: 'interior',
                layers: [
                    { id: 1, name: 'Primaire: PPG', target: 70, unit: 'µm', status: 'Pending', actual: null, humidity: null },
                    { id: 2, name: 'Finale: PPG', target: 150, unit: 'µm', status: 'Pending', actual: null, humidity: null },
                ]
            }
        );

        // 4. Corrosion Data (Random points)
        if (index % 2 !== 0) {
            corrosionData.push({
                id: Date.now() + index,
                rtgId,
                x: 20 + index * 5,
                y: 30 + index * 5,
                severity: index === 2 ? 'High' : 'Medium',
                notes: `Zone Z0${(index % 6) + 1} corrosion detected`,
                zone: `Z0${(index % 6) + 1}`
            });
        }
    });

    return {
        rtgs,
        zones: [
            { id: 'Z01', name: 'Z01 - Columns (COL)', description: 'Columns' },
            { id: 'Z02', name: 'Z02 - Crossbeam (XBM)', description: 'Left/Right Crossbeam' },
            { id: 'Z03', name: 'Z03 - Sill Beam (SIL)', description: 'DS/DOS Sill Beam' },
            { id: 'Z04', name: 'Z04 - Trolley (TRO)', description: 'Trolley' },
            { id: 'Z05', name: 'Z05 - Wheel Bogie (BOG)', description: 'Wheel Bogie' },
            { id: 'Z06', name: 'Z06 - E-House Support (EHS)', description: 'E-House Support' }
        ],
        users: [
            { id: 1, name: 'Adil T.', role: 'Manager', idRef: 'USR-0001' },
            { id: 2, name: 'Tech 1', role: 'Technician', idRef: 'USR-0002' }
        ],
        workOrders,
        paintingData,
        corrosionData,
        photos: [],
        reports: []
    };
};
