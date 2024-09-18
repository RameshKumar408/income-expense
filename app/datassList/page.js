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

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


export default function Home() {

    const [datas, setDatas] = useState([])

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
                getAuthToken(dts?.result?.refreshtoken)
            }

        } catch (error) {
            console.log("🚀 ~ getAuthToken ~ error:", error)
        }
    }

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [selecData, setSelecData] = useState("")

    useEffect(() => {
        getDetaills()
    }, [])

    return (
        <div>
            <div className="cntrdiv">

                {
                    datas?.length > 0 && datas?.map((data, index) => {
                        return (
                            <>
                                <div class="card" key={index} onClick={() => { setSelecData(data); handleOpen() }}>
                                    <Image class="card2" alt={data?.name?.split(".")[1]} src={data.name?.split(".")[1] == "pdf" ? pdf : data.name?.split(".")[1] == "jpg" || data.name?.split(".")[1] == "jpeg" || data.name?.split(".")[1] == "png" ? img : file} />
                                    <div>{data?.name}</div>
                                </div >
                                {/* <div key={index}>{data.id}............ {data.name}</div> */}
                            </>
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
                            <RWebShare
                                data={{
                                    text: "Share this page",
                                    url: "https://xdsea-prod-media-container.s3.amazonaws.com/profile/1698743028447.png",
                                    title: "My page",
                                }}
                                onClick={() => console.log('shared successfully!')}
                            >
                                <Button variant="contained">Share</Button>
                            </RWebShare>
                            <Button variant="contained" onClick={() => window.open(`https://drive.google.com/file/d/${selecData?.id}/view?usp=drivesdk`)} >view</Button>
                            <Button variant="contained" onClick={() => { window.open(`https://drive.google.com/uc?id=${selecData?.id}&export=download`) }
                            } >download</Button>
                        </div>
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
}
