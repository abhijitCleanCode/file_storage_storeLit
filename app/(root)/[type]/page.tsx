import React from 'react'
import { SearchParamProps } from '@/types'
import Sort from '@/components/Sort'
import { getFiles } from '@/lib/actions/server.actions'
import { Models } from 'node-appwrite'
import Card from '@/components/Card'

// get the file type from params
const page = async ({ params }: SearchParamProps) => {
    // in the new version of next js you need to await to get params from props
    const type = (await params)?.type as string || ""

    const files = await getFiles();

    return (
        <div className="page-container">
            <section className='w-full'>
                <h1 className="h1 capitalize">{type}</h1>

                <div className='total-size-section'>
                    <p className="body-1">
                        Total <span className='h5'>0 MB</span>
                    </p>

                    <div className="sort-conatiner">
                        <p className='body-1 hidden sm:block text-light-200'>Sort By:</p>
                        <Sort />
                    </div>
                </div>
            </section>

            {/* Render the files */}
            {files.total > 0 ? (
                <section className='file-list'>
                    {files.documents.map((file: Models.Document) => (
                        <Card key={file.$id} file={file} $id={''} $collectionId={''} $databaseId={''} $createdAt={''} $updatedAt={''} $permissions={[]} />
                    ))}
                </section>
            ) : (
                <p className="empty-list">No files uploaded</p>
            )}
        </div>
    )
}

export default page

// first we have to know which file we have to fetch.