// components/dynasty/sections/tools/player-name-generator.tsx

'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/display/button'
import { Input } from '@/components/ui/form/input'
import { Label } from '@/components/ui/form/label'

const FIRST_NAMES = [
    'James', 'Marcus', 'DeAndre', 'Malik', 'Jaylon', 'Bryce', 'Caleb', 'Darius',
    'Terrance', 'Jalen', 'Tyrone', 'Xavier', 'Zion', 'Kamari', 'Desmond', 'Trevon',
    'Jayden', 'Micah', 'Donovan', 'Andre', 'Isaiah', 'Kobe', 'Lamar', 'Devin',
    'Rashad', 'Quincy', 'Davion', 'Keanu', 'Miles', 'Elijah', 'Aaron', 'Cameron',
    'Brandon', 'Tyler', 'Jordan', 'Chris', 'Austin', 'Dylan', 'Mason', 'Logan',
    'Hunter', 'Colton', 'Brock', 'Tanner', 'Cody', 'Jake', 'Wyatt', 'Chase',
    'Cole', 'Garrett', 'Trevor', 'Blake', 'Ryan', 'Kyle', 'Sean', 'Patrick',
    'Connor', 'Nolan', 'Aidan', 'Liam', 'Noah', 'Ethan', 'Owen', 'Carter',
    'Jaylen', 'Amari', 'Tre', 'DaShawn', 'Kwame', 'Tyrell', 'Kendrick', 'Marquise',
    'Tavon', 'Jamal', 'Kareem', 'Devonte', 'Braxton', 'Keegan', 'Gunner', 'Bo',
    'Deshawn', 'Terrell', 'DeVonte', 'Kadarius', 'Jaquan', 'Travon', 'Khalil', 'Jabari',
    'Tyrese', 'Damien', 'Malcolm', 'Reggie', 'Demetrius', 'Javon', 'Trey', 'Dashon',
    'CJ', 'AJ', 'DJ', 'TJ', 'JR', 'Beau', 'Colt', 'Cash',
    'Stone', 'Blaze', 'Maverick', 'Ace', 'Knox', 'Jax', 'Crew', 'Nash',
]

const LAST_NAMES = [
    'Williams', 'Johnson', 'Smith', 'Brown', 'Jones', 'Davis', 'Wilson', 'Thomas',
    'Jackson', 'White', 'Harris', 'Robinson', 'Clark', 'Lewis', 'Walker', 'Young',
    'Allen', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson',
    'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres', 'Parker',
    'Collins', 'Edwards', 'Stewart', 'Morris', 'Murphy', 'Cook', 'Rogers', 'Morgan',
    'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell', 'Gomez', 'Kelly', 'Howard',
    'Ward', 'Cox', 'Richardson', 'Watson', 'Brooks', 'Wood', 'Bennett', 'Gray',
    'James', 'Reyes', 'Cruz', 'Hughes', 'Price', 'Myers', 'Long', 'Foster',
    'Sanders', 'Ross', 'Morales', 'Powell', 'Sullivan', 'Russell', 'Ortiz', 'Jenkins',
    'Gutierrez', 'Perry', 'Butler', 'Barnes', 'Fisher', 'Henderson', 'Coleman', 'Simmons',
    'Washington', 'Jefferson', 'Marshall', 'Hamilton', 'Graham', 'Dixon', 'Gibson', 'Hunt',
    'Daniels', 'Snyder', 'Burns', 'Stone', 'Knight', 'Webb', 'Fields', 'Fox',
    'Cross', 'Mills', 'Chambers', 'Holt', 'Lambert', 'Fletcher', 'Watts', 'Bates',
    'Hale', 'Boone', 'Haynes', 'McBride', 'Beasley', 'Ingram', 'McCoy', 'Stafford',
]

const MAX_NAMES = 5

export function PlayerNameGenerator() {
    const [numNames, setNumNames] = useState('1')
    const [generatedNames, setGeneratedNames] = useState<string[]>([])

    const generate = () => {
        const count = Math.min(MAX_NAMES, Math.max(1, Number(numNames) || 1))
        const names = Array.from({ length: count }, () => {
            const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
            const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
            return `${first} ${last}`
        })
        setGeneratedNames(names)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Label className="text-xs whitespace-nowrap">How many (max {MAX_NAMES}):</Label>
                <Input
                    type="number"
                    min={1}
                    max={MAX_NAMES}
                    value={numNames}
                    onChange={(e) => setNumNames(e.target.value)}
                    onBlur={() => {
                        const n = Math.min(MAX_NAMES, Math.max(1, Number(numNames) || 1))
                        setNumNames(String(n))
                    }}
                    className="h-8 w-16"
                />
            </div>

            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    bg="var(--primary)"
                    text="white"
                    onClick={generate}
                    className="text-xs font-semibold"
                >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Generate
                </Button>
            </div>

            {generatedNames.length > 0 && (
                <div className="space-y-1.5">
                    {generatedNames.map((name, i) => (
                        <div
                            key={i}
                            className="rounded-md border border-primary/15 bg-primary/5 px-3 py-2 text-sm font-medium"
                        >
                            {name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
