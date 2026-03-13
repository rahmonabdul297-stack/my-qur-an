import { Link } from "react-router"

const Logo = () => {
    return (
        <div>
            <Link to="/">
             <div  className="font-bold text-xl first-letter:text-AppGreen first-letter:text-4xl">
                   DailyQur'an
             </div>
            </Link>
        </div>
    )
}

export default Logo
