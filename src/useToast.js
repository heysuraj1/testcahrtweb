import toast from "react-hot-toast"


const useToast = () => {
    const toastError = (message) => toast(message,
        {
            icon: '🚫',
            style: {
                borderRadius: '15px',
                background: '#eb3131',
                color: '#fff',

            },
        }
    )

    const toastSuccess = (message) => toast(message,
        {
            icon: '✅',
            style: {
                borderRadius: '15px',
                background: '#45b944',
                color: '#fff',
            },
        }
    )

    return { toastError, toastSuccess }
}

export default useToast
