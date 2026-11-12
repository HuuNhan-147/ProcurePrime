import { tx, uiMessage, uiText, useLocale, locale, formatVND } from "../i18n";
import React, { useEffect, useState } from "react";
import { fetchProductDetails } from "../api/productApi";
import { fetchCategory } from "../api/CategoryApi";
import { IProduct, ISpecification } from "../types/product";
import { ICategory } from "../types/category";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AddToCartButton } from "./AddToCartButton";
import { submitReview, getProductReviews } from "../api/productApi";
import { useAuth } from "../context/AuthContext";
import { IReview } from "../types/review";
import { AxiosError } from "axios";
import { Star, CheckCircle, ShieldCheck, Truck, ArrowLeft } from "lucide-react";

const ProductDetail: React.FC = () => {
  useLocale();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const passedProduct = location.state?.product as IProduct | undefined;
  const [product, setProduct] = useState<IProduct | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [showReviews, setShowReviews] = useState<boolean>(true); // Show by default or use tab
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const navigate = useNavigate();

  const { token, user } = useAuth();

  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategory();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };

    const getProductDetail = async () => {
      if (passedProduct) {
        const updatedProduct = {
          ...passedProduct,
          image: passedProduct.image || "/images/no-image.png",
        };
        setProduct(updatedProduct);
        setLoading(false);
        // Still fetch fresh review data if using passed product
        if (passedProduct._id) {
             try {
                const reviewsData: IReview[] = await getProductReviews(passedProduct._id);
                setReviews(reviewsData);
                 const userHasReviewed = reviewsData.some(
                    (review: IReview) => review.user === user?.name
                  );
                  setHasReviewed(userHasReviewed);
             } catch(e) { console.log(e)}
        }
        return;
      }

      try {
        if (!id) {
          setError(uiMessage("catalog:productIdNotFound"));
          return;
        }
        const data = await fetchProductDetails(id);
        setProduct(data);
        
        // Fetch reviews
        const reviewsData: IReview[] = await getProductReviews(id);
        setReviews(reviewsData);
        const userHasReviewed = reviewsData.some(
          (review: IReview) => review.user === user?.name
        );
        setHasReviewed(userHasReviewed);

      } catch (err) {
        setError(uiMessage("catalog:unableToLoadProductDetails"));
      } finally {
        setLoading(false);
      }
    };

    getCategories();
    getProductDetail();
  }, [id, passedProduct, user?.name]);


  const handleReviewSubmit = async () => {
    if (rating < 1 || rating > 5) {
      alert(tx("catalog:selectAValidRatingFrom1To"));
      return;
    }
    if (!comment.trim()) {
      alert(tx("catalog:enterYourReview"));
      return;
    }

    if (hasReviewed) {
      alert(tx("catalog:youHaveAlreadyReviewedThisProduct"));
      return;
    }

    try {
      if (!token) {
        alert(tx("catalog:pleaseSignInToSubmitAReview"));
        navigate("/login");
        return;
      }
      // Use product._id from state, not just hook id, to be safe
      const targetId = product?._id || id;
      if (!targetId) return;

      const response = await submitReview(targetId, token, rating, comment);
      if (response) {
        alert(tx("catalog:yourReviewHasBeenSubmitted"));
        // Refresh reviews
        const reviewsData: IReview[] = await getProductReviews(targetId);
        setReviews(reviewsData);
        setHasReviewed(true);
      }
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err);
      if ((err as AxiosError).isAxiosError) {
        const axiosError = err as AxiosError;
        if (axiosError.response?.status === 400) {
          alert(tx("catalog:youHaveAlreadyReviewedThisProduct"));
          return;
        }
      }
      alert(tx("catalog:anErrorOccurredWhileSubmittingYourReview"));
    }

    setRating(0);
    setComment("");
  };

  const handleBuyNow = () => {
    if (!token) {
      alert(tx("catalog:pleaseSignInToPurchase"));
      navigate("/login");
      return;
    }

    if (product) {
      const productToSend = {
        ...product,
        image: product.image?.startsWith("http://localhost:5000")
          ? product.image.replace("http://localhost:5000", "")
          : product.image,
      };

      navigate("/create", {
        state: { product: productToSend },
      });
    }
  };

  if (loading)
    return (
      <div className="pp-screen pp-detail flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="pp-screen pp-detail flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
             <h2 className="text-2xl font-bold text-gray-800">{tx("catalog:anErrorOccurred")}</h2>
            <p className="text-red-500 mt-2">{uiText(error)}</p>
            <button type="button" onClick={() => navigate(-1)} className="mt-4 text-[#254AD7] hover:underline">{tx("catalog:back")}</button>
        </div>
      </div>
    );
    
  const categoryName = categories.find(
    (category) => category._id === product?.category
  )?.name;

  return (
    <div className="pp-screen pp-detail bg-gray-50 min-h-screen pb-12 font-sans">
        {/* Breadcrumb / Back */}
        <div className="container mx-auto px-4 py-4 max-w-7xl">
            <button type="button"
                onClick={() => navigate(-1)} 
                className="flex items-center text-gray-500 hover:text-[#254AD7] transition"
            >
                <ArrowLeft size={18} className="mr-1"/>{" "}{tx("catalog:back")}</button>
        </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="flex flex-col md:flex-row">
                {/* Product Image Section */}
                <div className="md:w-1/2 p-6 md:p-8 bg-gray-50 flex items-center justify-center">
                    <img
                        src={product?.image}
                        alt={uiText(product?.name)}
                        className="w-full max-w-md object-contain rounded-lg mix-blend-multiply transition duration-500 ease-in-out"
                    />
                </div>

                {/* Product Info Section */}
                <div className="md:w-1/2 p-6 md:p-10 flex flex-col">
                     {/* Category & Status */}
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold tracking-wider text-[#254AD7] uppercase">{uiText(categoryName || tx("catalog:products"))}</span>
                        <div className={` flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${product?.countInStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}  `}>
                            {product?.countInStock ? <CheckCircle size={14}/> : null}
                            <span>{uiText(product?.countInStock ? tx("catalog:inStock2") : tx("catalog:outOfStock"))}</span>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 leading-tight">
                        {uiText(product?.name)}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-6">
                        <div className="flex text-yellow-400">
                             {[...Array(5)].map((_, i) => (
                                <Star key={i} size={18} fill={(product?.rating || 0) >= i + 1 ? "currentColor" : "none"} stroke="currentColor" className={i < Math.round(product?.rating || 0) ? "text-yellow-400" : "text-gray-300"} />
                             ))}
                        </div>
                        <span className="text-sm text-gray-500 font-medium">({uiText(product?.numReviews || 0)}{" "}{tx("catalog:reviews")}</span>
                    </div>

                    {/* Price */}
                     <div className="flex items-end space-x-4 mb-6">
                        <span className="text-4xl font-bold text-[#254AD7]">
                            {product && formatVND(product.price)}</span>
                        {/* Example original price if we had it */}
                        {/* <span className="text-lg text-gray-400 line-through mb-1">25.000.000đ</span> */}
                    </div>

                    <p className="text-gray-600 text-base leading-relaxed mb-8">
                       {uiText(product?.description)}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                        <div className="flex-1">
                             <AddToCartButton product={product!} className="w-full" />
                        </div>
                        <button type="button"
                            onClick={handleBuyNow}
                            disabled={!product?.countInStock}
                            className={` flex-1 px-6 py-3 text-white rounded-lg transition duration-300 font-bold ${
                              !product?.countInStock 
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#254AD7] hover:bg-[#254AD7]"
                            }  `}
                        >{tx("catalog:buyNow")}</button>
                    </div>

                     {/* Policy Features */}
                     <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <Truck className="text-[#254AD7]" size={20}/>
                            <span>{tx("catalog:nationwideDelivery")}</span>
                        </div>
                         <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <ShieldCheck className="text-[#254AD7]" size={20}/>
                            <span>{tx("catalog:manufacturerWarranty")}</span>
                        </div>
                     </div>
                </div>
            </div>
        </div>

        {/* Specifications Section */}
        {product?.specifications && product.specifications.length > 0 && (
             <div className="mt-8 bg-white rounded-lg border border-gray-100 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{tx("catalog:specifications")}</h2>
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                     {product.specifications.map((spec, index) => (
                        <div key={index} className="flex justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition px-2 rounded-lg">
                             <span className="text-gray-500 font-medium">{uiText(spec.key)}</span>
                             <span className="text-gray-900 font-semibold text-right">
                                 {uiText(spec.value)} {spec.unit && <span className="text-gray-400 text-sm ml-1">{uiText(spec.unit)}</span>}
                             </span>
                        </div>
                     ))}
                </div>
             </div>
        )}

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg border border-gray-100 p-6 md:p-8">
             <div className="flex justify-between items-center mb-8">
                <div>
                     <h2 className="text-2xl font-bold text-gray-900">{tx("catalog:ratingsReviews")}</h2>
                     <p className="text-gray-500 text-sm mt-1">{tx("catalog:reviewsFromCustomersWhoPurchasedThisProduct")}</p>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-bold text-[#254AD7]">{uiText(product?.rating?.toFixed(1) || 0)}</span>
                     <span className="text-gray-400 text-sm"> / 5</span>
                     <div className="flex text-yellow-400 text-sm">
                         {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={(product?.rating || 0) >= i + 1 ? "currentColor" : "none"} stroke="currentColor" />
                         ))}
                     </div>
                </div>
             </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                {/* Review List */}
                 <div className="md:col-span-2 space-y-6">
                    {reviews.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <p className="text-gray-500">{tx("catalog:noReviewsYetBeTheFirst")}</p>
                        </div>
                    ) : (
                        reviews.map((review, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg border border-gray-100 transition">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-[#254AD7] flex items-center justify-center text-white font-bold">
                                         {uiText(review.name?.charAt(0).toUpperCase())}
                                    </div>
                                    <div>
                                         <p className="font-bold text-gray-900">{uiText(review.name)}</p>
                                          <p className="text-xs text-gray-400">
                                            {uiText(new Date(review.createdAt).toLocaleDateString(locale(), {
                                                year: "numeric", month: "long", day: "numeric"
                                            }))}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex text-yellow-400 bg-yellow-50 px-2 py-1 rounded-lg">
                                    {[...Array(5)].map((_, i) => (
                                       <Star key={i} size={14} fill={review.rating >= i + 1 ? "currentColor" : "none"} stroke={review.rating >= i + 1 ? "none" : "currentColor"} className={review.rating >= i + 1 ? "" : "text-gray-300"}/>
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{uiText(review.comment)}</p>
                        </div>
                        ))
                    )}
                 </div>

                 {/* Write Review */}
                 <div className="md:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-lg sticky top-24 border border-gray-100">
                         <h3 className="text-lg font-bold text-gray-900 mb-4">{tx("catalog:writeAReview")}</h3>
                         
                         <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{tx("catalog:yourRating")}</label>
                            <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button aria-label={tx("catalog:selectARating")} type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={` p-1 transition ${star <= rating ? "text-yellow-400 transform scale-110" : "text-gray-300 hover:text-yellow-200"}  `}
                                    >
                                         <Star size={24} fill={star <= rating ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                         </div>

                         <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{tx("catalog:review")}</label>
                             <textarea aria-label={tx("catalog:review")}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={tx("catalog:shareYourThoughtsAboutThisProduct")}
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                            />
                         </div>

                         <button type="button"
                            onClick={handleReviewSubmit}
                            disabled={hasReviewed}
                            className={` w-full py-3 rounded-lg font-bold transition transform active:scale-95 ${
                                hasReviewed
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-[#254AD7] text-white hover:bg-[#254AD7]"
                            }  `}
                        >
                            {uiText(hasReviewed ? tx("catalog:reviewed") : tx("catalog:submitReview"))}
                         </button>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
