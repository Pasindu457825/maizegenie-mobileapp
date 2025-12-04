from .service import predict_disease_enhanced


def handle_disease_detection(image_bytes: bytes, conf: float, return_image: bool):
    """
    Controller layer — separates business logic from the router.
    """
    return predict_disease_enhanced(
        image_bytes=image_bytes,
        conf=conf,
        return_image=return_image
    )
