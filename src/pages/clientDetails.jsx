import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const ClientDetailsPage = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    console.log("kdjhfsjdfhsjdf", id)
    return (
        <>
            <h1>Client Details Page {id} </h1>
        </>
    )
}
export default ClientDetailsPage;
