import React from 'react'
import { Avatar, Button, Card } from 'flowbite-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function DashProfile() {
    const { currentUser } = useSelector(state => state.user)

    return (
        <div className="w-full">
            <div className="flex p-2 justify-end">
                <Button className="border-2 border-blue-400 text-black dark:text-white bg-transparent outline">
                    Edit Profile
                </Button>
            </div>
            <div className="flex flex-col items-center w-full m-auto">
                <div className="w-full bg-gradient-to-r from-indigo-300 to-purple-200 dark:from-indigo-700 dark:to-purple-500">
                    <div className="flex w-full px-10 py-4 gap-20">
                        <img
                            src={currentUser.avatar}
                            alt="user"
                            className="rounded-full w-20 h-20 object-cover border-2 border-lightgray dark:border-gray-800"
                        />
                        <div className="flex-col justify-center">
                            <h2 className="text-3xl font-bold text-black dark:text-white">{currentUser.fullName}</h2>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-300">{currentUser.username}</h3>
                        </div>
                    </div>
                    <div className="flex w-full p-4 pl-10 gap-10 text-black dark:text-white">
                        <span>Followers: {currentUser.followers || 'NA'}</span>
                        <span>Followings: {currentUser.followings || 'NA'}</span>
                    </div>
                </div>
                {currentUser.bio && (
                    <div className="flex w-full flex-col p-4">
                        <div className="text-2xl font-bold text-black dark:text-white">About Me</div>
                        <div className="text-black dark:text-slate-300">{currentUser.bio}</div>
                    </div>
                )}
                <div className="flex flex-wrap mt-10 p-4 w-full justify-between gap-10 border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-r from-blue-200 to-slate-300 dark:from-blue-700 dark:to-slate-700 rounded-md">
                    <h2 className="text-2xl font-bold text-black dark:text-white">Manage Content {'>'}</h2>
                    <Card href="/dashboard?tab=blogs" className="max-h-12 font-bold items-center">
                        My Blogs {'>'}
                    </Card>
                    <Card href="/dashboard?tab=videos" className="max-h-12 font-bold items-center">
                        My Videos {'>'}
                    </Card>
                    <Card href="/dashboard?tab=discussions" className="max-h-12 font-bold items-center">
                        My Discussions {'>'}
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default DashProfile
