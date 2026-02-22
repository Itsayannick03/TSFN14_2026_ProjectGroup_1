resource "kubernetes_namespace" "app" {
  metadata {
    name = "hair-salon"
  }
}

resource "kubernetes_deployment" "app" {
  metadata {
    name      = "hair-salon-deployment"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    replicas = 3

    selector {
      match_labels = {
        app = "hair-salon"
      }
    }

    template {
      metadata {
        labels = {
          app = "hair-salon"
        }
      }

      spec {
        container {
          name  = "hair-salon-container"
          image = "hair-salon-app:latest"

          image_pull_policy = "Never"

          port {
            container_port = 5000
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "app" {
  metadata {
    name      = "hair-salon-service"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    selector = {
      app = "hair-salon"
    }

    port {
      port        = 5000
      target_port = 5000
    }

    type = "NodePort"
  }
}