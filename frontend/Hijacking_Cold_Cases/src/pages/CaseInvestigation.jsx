import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import React from "react";

export default function CaseInvestigation(){
    const {id} = useParams() //gets id from url params
    const [caseData, setCaseData] = useState(null)

    useEffect(() => {
        axios.get(`cases/${id}/`)
            .then((res) => {
                console.log("Raw response:", res.data);
                setCaseData(res.data); // now this actually runs
            })
            .catch(err => console.error('Error loading case: ', err));
    }, [id]);
    

    if (!caseData) return <p>Loading case...</p>
    console.log("Title:", caseData.title)
    console.log("Summary:", caseData.summary)
    console.log("Alibis:", caseData.alibis)


    return (
        <div className="p-6">
            {/* Case title */}
            <h1 className="text-2xl font-bold">{caseData.title}</h1>
            {/*brief summary/teaser */}
            <p className="italic text-gray-600 mb-4">{caseData.summary}</p>
            
            <Link to="/cases" className="text-blue-600 underline mb-4 inline-block">← Back to case list</Link>

            {/*Selection: Character files (alibis) */}
            <h2 className="text-xl font-semibold mt-6">Character Files</h2>
            {/* Grid layout for character cards */}
            <div className="grid gap-4 mt-2 sm:grid-cols-2 md:grid-cols-3">
            {/* Loop through the alibis object (if it exists) */}
            {Object.entries(caseData.alibis || {}).map(([name, alibi]) => {
                const clueObj = caseData.clues?.find(clue => clue.character === name)
                return (
                    <div
                        key={name}
                            className="bg-white p-4 rounded shadow hover:shadow-lg transition duration-200">
                        {/* Character name */}
                        <h3 className="font-bold text-lg">{name}</h3>
                        {/* Character alibi */}
                        <p className="text-sm mt-1">{alibi}</p>
                        {/* character Clue */}
                        <p className="text-sm text-gray-800 mt-2">
                            <span className="font-semibold">Clue:</span> {" "}
                            {clueObj ? clueObj.text : "No Clue Assigned"}

                        </p>
                    </div>
                )
              })}
            </div>
        </div>
    )

}
