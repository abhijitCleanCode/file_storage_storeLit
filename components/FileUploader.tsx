"use client"

import React, { useCallback, useState } from 'react'
import { useDropzone } from "react-dropzone"
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { convertFileToUrl, getFileType } from '@/lib/utils';
import Thumbnail from './Thumbnail';
import { MAX_FILE_SIZE } from '@/constants';
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from '@/lib/actions/server.actions';
import { usePathname } from 'next/navigation';

interface Props {
    ownerId: string;
    accountId: string;
    className?: string;
}

const FileUploader = ({ ownerId, accountId, className }: Props) => {
    const path = usePathname();
    const [files, setFiles] = useState<File[]>([]);
    const { toast } = useToast();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        // Do something with the files
        setFiles(acceptedFiles);

        // promises because in case of multiple file upload, we want to upload file one by one
        const uploadPromises = acceptedFiles.map(async (file) => {
            // remove the file which is bigger than 50mb
            if (file.size > MAX_FILE_SIZE) {
                // get access to the prev state because we are modifying the current state based on prev state
                setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));

                return toast({
                    description: (
                        <p className='body-2 text-white'>
                            <span className='font-semibold'>{file.name}</span>
                            is too large. Max file size 50 MB. Upgrade to Premium for large file upload.
                        </p>
                    )
                });
            }

            return uploadFile({ file, ownerId, accountId, path })
                .then((uploadFile) => {
                    if (uploadFile) {
                        setFiles((prevFiles) => prevFiles.filter((f) => f.name !== uploadFile.name));
                    }
                })
        })

        await Promise.all(uploadPromises);
    }, [ownerId, accountId, path]);
    const { getRootProps, getInputProps } = useDropzone({ onDrop })

    const handleRemoveFile = (e: React.MouseEvent<HTMLImageElement, MouseEvent>, fileName: string) => {
        e.stopPropagation();

        // set the files to get the previous file, modifying the state using the previous state
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName))
    }

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            <Button type="button" className={cn("uploader-button", className)}>
                <Image
                    src="/assets/icons/upload.svg"
                    alt="uploadFiles"
                    width={24}
                    height={24}
                />
                <p>Upload</p>
            </Button>
            {
                files.length > 0 && (
                    <ul className="uploader-preview-list">
                        <h4 className="h4 text-light-100">Uploading</h4>

                        {files.map((file, index) => {
                            const { type, extension } = getFileType(file.name);

                            return (
                                <li key={`${file.name}-${index}`} className='uploader-preview-item'>
                                    <div className='flex items-center gap-3'>
                                        <Thumbnail
                                            type={type}
                                            extension={extension}
                                            url={convertFileToUrl(file)}
                                        />

                                        <div className="preview-item-name">
                                            {file.name}
                                            <Image
                                                src="/assets/icons/file-loader.gif"
                                                alt=''
                                                width={80}
                                                height={80}
                                            />
                                        </div>
                                    </div>

                                    <Image src="/assets/icons/remove.svg" width={24} height={24} alt='Remove' onClick={(e) => handleRemoveFile(e, file.name)} />
                                </li>
                            )
                        })}
                    </ul>
                )
            }
        </div>
    )
}

export default FileUploader