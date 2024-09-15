"use client"


export default function Home() {
    const clientId = '389689030947-ptjknqqo8at8ge4panv2juqadffofrdk.apps.googleusercontent.com'

    const getAuth = async () => {
        var url = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://localhost:3000/authtoken&prompt=consent&response_type=code&client_id=${clientId}&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&access_type=offline`
        window.location.replace(url)
    }
    return (
        <button onClick={() => { getAuth() }} >
            GoogleLogin
        </button>
    )
}