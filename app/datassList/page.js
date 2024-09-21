'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import constant from "@/constant";
import './datasslist.css'
import img from '../../public/images.png'
import pdf from '../../public/pdf.webp'
import Image from 'next/image'
import file from '../../public/file.webp'

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import { RWebShare } from "react-web-share";
import folder from '../../public/folder.jpg'
import TextField from '@mui/material/TextField';
import { toast } from "react-toastify";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


export default function Home() {

    const [datas, setDatas] = useState([])

    const [fold, setFold] = useState([])

    const [token, setToken] = useState('')

    const [folderFiles, setFolderFiles] = useState([])

    const getAuthToken = async (id) => {
        try {
            const { data } = await axios.post(`${constant?.Live_url}/api/getdrivedata`, {
                Title: id
            })
            setDatas(data?.topics)
        } catch (error) {
            console.log("🚀 ~ getAuthToken ~ error:", error)
        }
    }

    const getDetaills = async () => {
        try {
            const res = await fetch(`${constant?.Live_url}/api/googleDrive/apikeys`, {
                method: "GET",
                headers: {
                    "Content-type": "application/json",
                    "authorization": window.localStorage.getItem("token")
                },
            });
            if (res.status == 200) {
                var dts = await res.json()
                setToken(dts?.result?.refreshtoken)
                getAuthToken(dts?.result?.refreshtoken)
                getFolders(dts?.result?.refreshtoken)
            }

        } catch (error) {
            console.log("🚀 ~ getAuthToken ~ error:", error)
        }
    }

    const getFolders = async (id) => {
        try {
            const { data } = await axios.post(`${constant?.Live_url}/api/getFolders`, {
                Title: id
            })
            setFold(data?.topics)
        } catch (error) {
            console.log("🚀 ~ getFolders ~ error:", error)
        }
    }

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [selecData, setSelecData] = useState("")

    useEffect(() => {
        getDetaills()
    }, [])


    const [type, settype] = useState("file")
    const [name, setName] = useState('')

    const [textOpen, setTextOpen] = useState(false)
    const handletxtOpen = () => setTextOpen(true);
    const handletxtClose = () => setTextOpen(false);

    const [foldeview, setFolderView] = useState(false)
    const handlefoldOpen = () => setFolderView(true);
    const handlefoldClose = () => setFolderView(false);

    const [uploadFlie, setUploadFile] = useState(false)
    const handleFilesOpen = () => setUploadFile(true);
    const handleFilesClose = () => setUploadFile(false);

    const [folderFileOpen, setFolderFileOpen] = useState(false)
    const handleFolderFilesOpen = () => setFolderFileOpen(true);
    const handleFolderFilesClose = () => setFolderFileOpen(false);

    const [selcFolder, setSelcFolder] = useState("")

    const createFolder = async (id) => {
        try {
            const { data } = await axios.post(`${constant?.Live_url}/api/createFolder`, {
                Title: token,
                Name: name
            })
            handletxtClose()
            if (data?.topics) {
                getFolders(token)
                toast.success("Folder created successfully")
            }
        } catch (error) {
            console.log("🚀 ~ createFolder ~ error:", error)
        }
    }

    const getFileFromFolder = async (id) => {
        try {
            const { data } = await axios.post(`${constant?.Live_url}/api/fileFromFolder`, {
                Title: token,
                id: selcFolder
            })
            if (data) {
                setFolderFiles(data?.topics)
                handlefoldClose()
                setFileView(true)
            }
        } catch (error) {
            console.log("🚀 ~ getFileFromFolder ~ error:", error)
        }
    }

    const deleteFolder = async (id) => {
        try {
            const { data } = await axios.post(`${constant?.Live_url}/api/deleteFolder`, {
                Title: token,
                id: id ? id : selcFolder
            })
            handlefoldClose()
            if (data?.topics) {
                toast.success("Folder deleted successfully")
                if (id) {
                    handleFolderFilesClose()
                    getFileFromFolder()
                } else {
                    getFolders(token)
                }
            }
        } catch (error) {
            console.log("🚀 ~ deleteFolder ~ error:", error)
        }
    }

    const [fileview, setFileView] = useState(false)
    const [fileName, setFileName] = useState("")


    const [files, setFile] = useState()

    const CreateFile = async () => {
        try {
            const formdata = new FormData()
            formdata.append("file", files)
            formdata.append("name", fileName)
            formdata.append("Title", token)
            formdata.append("folderId", selcFolder)
            const { data } = await axios.post(`${constant?.Live_url}/api/uploadFile`, formdata)
            if (data?.message) {
                toast.success(data?.message)
                handleFilesClose()
                getFileFromFolder()
            }
        } catch (error) {
            console.log("🚀 ~ createFolder ~ error:", error)
        }
    }

    return (
        <div>


            <div className="btns-div">
                <Button variant="contained" onClick={() => { settype("folder") }}>Folder</Button>
                <Button variant="contained" onClick={() => { settype("file") }}>File</Button>
            </div>
            {
                type == "file" &&
                <>
                    <div className="cntrdiv">
                        {
                            datas?.length > 0 && datas?.map((data, index) => {
                                return (
                                    <div key={index}>
                                        <div className="card" onClick={() => { setSelecData(data); handleOpen() }}>
                                            <Image className="card2" alt={data?.name?.split(".")[1]} src={data.name?.split(".")[1] == "pdf" ? pdf : data.name?.split(".")[1] == "jpg" || data.name?.split(".")[1] == "jpeg" || data.name?.split(".")[1] == "png" ? img : file} />
                                            <div>{data?.name}</div>
                                        </div >
                                        {/* <div key={index}>{data.id}............ {data.name}</div> */}
                                    </div>
                                )
                            })
                        }
                    </div>
                    {
                        datas?.length == 0 &&
                        <div className="centerDiv">
                            <div className="loader">
                                <div className="circle"></div>
                                <div className="circle"></div>
                                <div className="circle"></div>
                                <div className="circle"></div>
                            </div>
                        </div>
                    }
                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                {selecData?.name}
                            </Typography>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                <div className="btns-div">
                                    {/* <RWebShare
                                data={{
                                    text: "Share this page",
                                    url: "https://xdsea-prod-media-container.s3.amazonaws.com/profile/1698743028447.png",
                                    title: "My page",
                                }}
                                onClick={() => console.log('shared successfully!')}
                            > */}
                                    {/* <RWebShare
                                        data={{
                                            text: 'Check out this amazing image!',
                                            url: "https://dtracer.io/wp-content/uploads/2022/06/LOGO-5-COMPLETO.png",
                                            title: 'Image Share',
                                            files: [
                                                new File(["https://dtracer.io/wp-content/uploads/2022/06/LOGO-5-COMPLETO.png"], 'image.png', { type: 'image/png' }) // This is just for demonstration; actual sharing of files may require Blob or File objects.
                                            ],
                                        }}
                                        onClick={() => console.log('Shared successfully!')}
                                    > */}
                                    <Button variant="contained">Share</Button>
                                    {/* </RWebShare> */}
                                    <Button variant="contained" onClick={() => window.open(`https://drive.google.com/file/d/${selecData?.id}/view?usp=drivesdk`)} >view</Button>
                                    <Button variant="contained" onClick={() => { window.open(`https://drive.google.com/uc?id=${selecData?.id}&export=download`) }
                                    } >download</Button>
                                </div>
                            </Typography>
                        </Box>
                    </Modal>
                </>
            }

            {
                type == "folder" &&
                <div className="cntrdiv">
                    {fileview == false && <Button onClick={() => { handletxtOpen() }} >Create Folder</Button>}
                    {fileview == true && <Button onClick={() => { handleFilesOpen() }} >Create File</Button>}
                    {fileview == true && <Button onClick={() => { setFileView(false) }} >Back</Button>}
                    {
                        fileview == false && fold?.length > 0 && fold?.map((data, index) => {
                            return (
                                <div key={index} >
                                    <div className="card" onClick={() => { setSelcFolder(data?.id); handlefoldOpen() }}>
                                        <Image className="card2" alt={"folder"} src={folder} />
                                        <div>{data?.name}</div>
                                    </div >
                                </div>
                            )
                        })
                    }

                    <div className="cntrdiv">
                        {
                            folderFiles?.length > 0 && folderFiles?.map((data, index) => {
                                return (
                                    <div key={index}>
                                        <div className="card" onClick={() => { setSelecData(data); handleFolderFilesOpen() }}>
                                            <Image className="card2" alt={data?.name?.split(".")[1]} src={data.name?.split(".")[1] == "pdf" ? pdf : data.name?.split(".")[1] == "jpg" || data.name?.split(".")[1] == "jpeg" || data.name?.split(".")[1] == "png" ? img : file} />
                                            <div>{data?.name}</div>
                                        </div >
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="cntrdiv">
                        {
                            folderFiles?.length == 0 && <div> No Data Found</div>
                        }
                    </div>

                    <Modal
                        open={textOpen}
                        onClose={handletxtClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                <div style={{ display: "flex", flexDirection: "column" }} >
                                    <TextField id="outlined-basic" label="Name" variant="outlined" onChange={(e) => setName(e.target.value)} />
                                    <Button variant="contained" onClick={() => createFolder()} >Create</Button>
                                </div>
                            </Typography>
                        </Box>
                    </Modal>

                    <Modal
                        open={foldeview}
                        onClose={handlefoldClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                <div style={{ display: "flex", flexDirection: "column" }} >
                                    <Button variant="contained" onClick={() => { getFileFromFolder() }}   >View</Button>
                                    <Button variant="contained" onClick={() => deleteFolder()} >Delete</Button>
                                </div>
                            </Typography>
                        </Box>
                    </Modal>

                    <Modal
                        open={folderFileOpen}
                        onClose={handleFolderFilesClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                {selecData?.name}
                            </Typography>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                <div className="btns-div">
                                    {/* <RWebShare
                                data={{
                                    text: "Share this page",
                                    url: "https://xdsea-prod-media-container.s3.amazonaws.com/profile/1698743028447.png",
                                    title: "My page",
                                }}
                                onClick={() => console.log('shared successfully!')}
                            > */}
                                    {/* <RWebShare
                                        data={{
                                            text: 'Check out this amazing image!',
                                            url: "https://dtracer.io/wp-content/uploads/2022/06/LOGO-5-COMPLETO.png",
                                            title: 'Image Share',
                                            files: [
                                                new File(["https://dtracer.io/wp-content/uploads/2022/06/LOGO-5-COMPLETO.png"], 'image.png', { type: 'image/png' }) // This is just for demonstration; actual sharing of files may require Blob or File objects.
                                            ],
                                        }}
                                        onClick={() => console.log('Shared successfully!')}  deleteFolder
                                    > */}
                                    <Button variant="contained">Share</Button>
                                    {/* </RWebShare> */}
                                    <Button variant="contained" onClick={() => { deleteFolder(selecData?.id) }} >delete</Button>
                                    <Button variant="contained" onClick={() => window.open(`https://drive.google.com/file/d/${selecData?.id}/view?usp=drivesdk`)} >view</Button>
                                    <Button variant="contained" onClick={() => { window.open(`https://drive.google.com/uc?id=${selecData?.id}&export=download`) }
                                    } >download</Button>
                                </div>
                            </Typography>
                        </Box>
                    </Modal>

                    <Modal
                        open={uploadFlie}
                        onClose={handleFilesClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                <div style={{ display: "flex", flexDirection: "column" }} >
                                    <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                                    <TextField id="outlined-basic" label="File Name" variant="outlined" onChange={(e) => setFileName(e.target.value)} />
                                    <Button variant="contained" onClick={() => CreateFile()} >Create</Button>
                                </div>
                            </Typography>
                        </Box>
                    </Modal>

                </div>
            }

        </div>
    );
}
