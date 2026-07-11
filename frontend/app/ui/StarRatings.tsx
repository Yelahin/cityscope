import { IoStar, IoStarHalf, IoStarOutline } from "react-icons/io5";


export default function StarRating ({rating}: {rating: number}) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
                if (rating >= star) {
                    return <IoStar key={star} className="text-yellow-400"/>
                } else if (rating >= star - 0.5) {
                    return <IoStarHalf key={star} className="text-yellow-400"/>
                } else {
                    return <IoStarOutline key={star} className="text-gray-400"/>
                }
            })}
        </div>
    )
}